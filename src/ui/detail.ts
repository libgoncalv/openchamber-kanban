import type { GuestSessionWorktree } from '@openchamber/sdk';
import { mountBanner, mountButton, mountList, mountSelect, mountTextField, type SelectOption } from '@openchamber/sdk/ui';
import { appendDictatedDescription, DESCRIPTION_MAX, STATUSES, STATUS_LABELS, TITLE_MAX, type Task, type TaskPatch } from '../domain/task.ts';
import { describeActivity, type SessionLiveState } from '../domain/boardView.ts';
import type { DictationController } from '../host/dictation.ts';
import { mountDictationPanel, type DictationPanel } from './dictationPanel.ts';
import { agentPill } from './pill.ts';
import {
  branchNameConflictsWithBase,
  buildSessionWorktree,
  DEFAULT_BASE_BRANCH_OPTION,
  DESTINATION_NEW,
  DESTINATION_ROOT,
  resolveBaseBranch,
} from '../domain/worktree.ts';
import { el } from './dom.ts';

export type SessionOption = { id: string; title: string; activity: string };
export type WorktreeOption = { id: string; label: string; hint?: string; disabled?: boolean };
export type WorktreeInfo = { destinations: WorktreeOption[]; baseBranches: SelectOption[]; hasKnownBranches: boolean };

export type TaskDetailProps = {
  task: Task;
  projects: Array<{ id: string; name: string }>;
  onSave: (patch: TaskPatch) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
  onOpenChat: (sessionId: string) => Promise<void>;
  onLinkSession: (sessionId: string, projectId: string | null) => Promise<void>;
  onUnlinkSession: () => Promise<void>;
  /**
   * Starts a real session for this task. Absent/null in the rail panel: the
   * worktree pickers stay board-only, where the width for them exists. The
   * "Or link an existing session" picker still renders without Start Agent.
   */
  onStartAgent?: ((input: { projectId: string; worktree: GuestSessionWorktree; title: string; description: string }) => Promise<void>) | null;
  loadSessionsForProject: (projectId: string) => Promise<SessionOption[]>;
  loadWorktreeInfo: (projectId: string) => Promise<WorktreeInfo>;
  /** Local voice dictation for the description; null/absent hides the mic button. */
  dictation?: DictationController | null;
  /** Non-blocking notices (dictation results, toasts): fires host.toast. */
  onToast?: (message: string, kind: 'info' | 'error') => void;
  /** Live state of the task's linked session, fresh on read — the head pill's source. Absent: no pill. */
  liveSession?: () => SessionLiveState | null;
  /** Single-column, tighter dialog for a narrow host surface (the rail panel). */
  compact?: boolean;
};

const defaultBaseBranchOptions: SelectOption[] = [{ id: DEFAULT_BASE_BRANCH_OPTION, label: 'Use project default' }];

/** Micro tone language for the "Or link an existing session" list badges — the
 *  same family the agent pills use, expressed in the kit's badge tones. */
const SESSION_BADGES: Record<string, { label: string; tone: 'neutral' | 'info' | 'warning' | 'error' }> = {
  running: { label: 'running', tone: 'info' },
  retrying: { label: 'retrying', tone: 'info' },
  'waiting-question': { label: 'needs your answer', tone: 'warning' },
  'waiting-permission': { label: 'needs permission', tone: 'warning' },
  idle: { label: 'idle', tone: 'neutral' },
};
const sessionBadge = (session: SessionOption) =>
  SESSION_BADGES[session.activity] ?? { label: session.activity, tone: 'neutral' as const };

export const mountTaskDetail = (root: Element, props: TaskDetailProps) => {
  const overlay = el('div', 'kb-overlay');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  const dialog = el('div', props.compact ? 'kb-dialog kb-dialog-compact' : 'kb-dialog');
  // Initial focus lands here, not on the first field: announcing and fencing
  // the dialog without forcing open the on-screen keyboard on touch.
  dialog.tabIndex = -1;
  overlay.append(dialog);
  root.append(overlay);

  const onKeydown = (event: KeyboardEvent) => {
    // A SDK select or menu popup that was open just consumed Escape
    // (it preventDefaults before bubbling here): its close belongs to the
    // popup, the dialog stays.
    if (event.defaultPrevented) return;
    if (event.key === 'Escape') {
      // While dictation is active, Escape belongs to it: a recording is
      // discarded, transcription keeps running (its panel has a Cancel action),
      // and the task dialog stays open.
      if (props.dictation && props.dictation.state !== 'idle') {
        if (props.dictation.state === 'recording') props.dictation.discard();
        return;
      }
      props.onClose();
      return;
    }
    if (event.key === 'Tab') trapTab(event);
  };
  /** The dialog is `aria-modal`, so keyboard focus must stay inside it. SDK
   *  popups mount inside the dialog's DOM (see the kit's `openPopup`), so a
   *  query at press time covers them too. */
  const trapTab = (event: KeyboardEvent) => {
    const focusables = [...dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), ' +
      'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )].filter((node) => node.offsetParent !== null || node === document.activeElement);
    if (focusables.length === 0) return;
    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
    const inside = dialog.contains(document.activeElement);
    if (!inside || (event.shiftKey && document.activeElement === first)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  overlay.addEventListener('click', (event) => { if (event.target === overlay) props.onClose(); });
  document.addEventListener('keydown', onKeydown);

  let title = props.task.title;
  let description = props.task.description;
  let status = props.task.status;
  let projectId = props.task.projectId ?? '';
  let dirty = false;
  let busy = false;
  /** null keeps "No project" out of the head sub line. */
  const projectName = (id: string | null) => props.projects.find((project) => project.id === id)?.name ?? null;
  const hasSession = Boolean(props.task.sessionId);
  /** Reassigned once the Start Agent button exists; a no-op once a session is linked. */
  let updateStartAgentAvailability = () => {};

  // The head names the task — the dialog you can no longer tell apart by its
  // id alone — with the live agent pill beside it when a trusted snapshot
  // exists. Typing keeps it current; the sub line keeps the durable facts
  // (id, project) in the mono idiom instead of burying them in prose.
  const head = el('div', 'kb-dialog-head');
  const headMain = el('div', 'kb-dialog-head-main');
  const headTitle = el('h2', '', props.task.title || 'New task');
  const headSub = el('div', 'kb-dialog-sub');
  const renderHeadSub = () => {
    const name = projectName(projectId || null);
    headSub.textContent = `Task · ${props.task.id}${name ? ` · project ${name}` : ''}`;
  };
  renderHeadSub();
  headMain.append(headTitle, headSub);
  head.append(headMain);
  const headLive = props.liveSession?.() ?? null;
  if (headLive) {
    const headLine = describeActivity(headLive);
    if (headLine) head.append(agentPill(headLine));
  }
  dialog.append(head);
  // Shown at both the top and the bottom of this (often tall, scrollable) dialog.
  // One error from one action taken anywhere in it — Save, Start Agent, link
  // session — so whichever end you're scrolled to, you still see it, without
  // relying on an auto-scroll that might not behave the same in every host.
  const errorSlotTop = el('div');
  dialog.append(errorSlotTop);
  const bannerTop = mountBanner(errorSlotTop, { tone: 'error', title: '' });
  errorSlotTop.hidden = true;
  const errorSlotBottom = el('div');
  errorSlotBottom.hidden = true;
  const bannerBottom = mountBanner(errorSlotBottom, { tone: 'error', title: '' });
  const showError = (error: unknown) => {
    const body = error instanceof Error ? error.message : String(error);
    errorSlotTop.hidden = false; bannerTop.update({ tone: 'error', title: 'Could not save', body });
    errorSlotBottom.hidden = false; bannerBottom.update({ tone: 'error', title: 'Could not save', body });
  };
  const clearError = () => { errorSlotTop.hidden = true; errorSlotBottom.hidden = true; };

  /** Every field's onChange routes through here so the Save button always reflects there's something unsaved. */
  const markDirty = () => { dirty = true; clearError(); save.update({ disabled: false }); };

  const grid = el('div', 'kb-dialog-grid');
  dialog.append(grid);
  const titleWrap = el('div', 'kb-span2'); grid.append(titleWrap);
  const titleField = mountTextField(titleWrap, {
    label: 'Title', value: title,
    onChange: (value) => { title = value; markDirty(); titleField.update({ value }); headTitle.textContent = value || 'New task'; updateStartAgentAvailability(); },
  });
  const descWrap = el('div', 'kb-span2'); grid.append(descWrap);
  const descField = mountTextField(descWrap, {
    label: 'Description / agent prompt', value: description, multiline: true, rows: 6,
    helper: 'This is what the agent sees as its first message when you start a session.',
    onChange: (value) => { description = value; markDirty(); descField.update({ value }); updateStartAgentAvailability(); },
  });

  // --- Voice dictation (microphone capability) ---
  // Only rendered when the host offered the microphone feature at ready. The
  // panel (OpenChamber's dictation look) holds all interaction: tap "Dictate"
  // to record, ✓ stops the capture and transcribes fully locally; the
  // recognized text is appended to the existing description with a single
  // space (never the title), and the field keeps focus. Discard/Cancel drops
  // the partial audio (or a running transcription) and closes the microphone.
  // The controller is per board mount, the panel per dialog — release it here.
  let disposeDictationPanel: (() => void) | null = null;
  if (props.dictation) {
    const onToast = (message: string, kind: 'info' | 'error') => props.onToast?.(message, kind);
    disposeDictationPanel = mountDictationPanel(descWrap, {
      dictation: props.dictation,
      onText: (text) => {
        const dictated = text.trim();
        if (!dictated) {
          onToast('Dictation returned no text — nothing was appended.', 'info');
          return;
        }
        const { description: next, clamped } = appendDictatedDescription(description, dictated);
        description = next;
        descField.update({ value: next });
        markDirty();
        updateStartAgentAvailability();
        if (clamped) onToast(`Description reached its ${DESCRIPTION_MAX}-character limit; the dictated text was cut to fit.`, 'info');
        // The appended text is immediately editable where it landed.
        descWrap.querySelector('textarea')?.focus();
      },
      onNotice: (body, kind) => onToast(body, kind),
    }).dispose;
  }
  // --- The board section: status + project. The status strip replaces the two
  // --- controls this dialog used to carry — a select that waited for Save plus
  // --- a row of "Move to" buttons — with one control that moves on click, the
  // --- same deliberate move the ⋯ menu and a drag make (it clears the
  // --- attention marker and keeps the card's rank; `quickStatus` owns that).
  const boardSection = el('div', 'kb-section'); dialog.append(boardSection);
  boardSection.append(el('div', 'kb-section-title', 'Board'));
  boardSection.append(el('p', 'kb-muted', 'Status — a click moves immediately, the same deliberate move a drag or the ⋯ menu makes.'));
  const statusSeg = el('div', 'kb-status-seg');
  statusSeg.setAttribute('role', 'group');
  statusSeg.setAttribute('aria-label', 'Move to status');
  boardSection.append(statusSeg);
  const renderStatusSeg = () => {
    statusSeg.replaceChildren();
    for (const target of STATUSES) {
      const segButton = el('button', 'kb-status-seg-btn', STATUS_LABELS[target]);
      segButton.type = 'button';
      const current = target === status;
      segButton.setAttribute('aria-pressed', String(current));
      // Pressing the status the task is already in is meaningless — out of the
      // tab order (a screen reader reads the strip's pressed state instead).
      if (current) segButton.disabled = true;
      segButton.addEventListener('click', () => { void quickStatus(target); });
      statusSeg.append(segButton);
    }
  };

  const projectWrap = el('div'); boardSection.append(projectWrap);
  const projectField = mountSelect(projectWrap, {
    label: 'Project', value: projectId || null, placeholder: 'No project',
    options: [{ id: '', label: 'No project' }, ...props.projects.map((p) => ({ id: p.id, label: p.name }))],
    searchable: props.projects.length > 6,
    onChange: (value) => {
      projectId = value; markDirty(); projectField.update({ value });
      renderHeadSub();
      refreshSessionPicker();
      refreshWorktreeOptions();
      updateStartAgentAvailability();
    },
  });

  // The footer is created before the section that fills its Start Agent slot
  // (that section only exists when a start flow does), but appended last, so
  // the DOM order stays: session section, error slot, footer.
  const footer = el('div', 'kb-row between');
  const dangerRow = el('div', 'kb-row'); footer.append(dangerRow);
  const footerActions = el('div', 'kb-row'); footer.append(footerActions);
  let confirmingDelete = false;
  const deleteBtn = mountButton(dangerRow, {
    label: 'Delete task', variant: 'ghost',
    onClick: () => {
      if (!confirmingDelete) { confirmingDelete = true; deleteBtn.update({ label: 'Click again to delete', variant: 'destructive' }); return; }
      void props.onDelete().catch(showError);
    },
  });
  mountButton(footerActions, { label: 'Close', variant: 'outline', onClick: () => props.onClose() });
  const save = mountButton(footerActions, {
    label: 'Save changes', disabled: !dirty, variant: 'secondary',
    onClick: () => {
      void (async () => {
        busy = true; save.update({ loading: true });
        try {
          await props.onSave({ title, description, status, projectId: projectId || null });
          dirty = false; save.update({ disabled: true });
        } catch (error) { showError(error); }
        finally { busy = false; save.update({ loading: false }); }
      })();
    },
  });
  const startAgentSlot = el('span'); footerActions.append(startAgentSlot);

  const quickStatus = async (next: Task['status']) => {
    if (busy || next === status) return;
    busy = true;
    try {
      // A Move-to is a deliberate move: it clears the attention marker,
      // exactly like dragging the card, the ⋯ menu's Move-to items, or
      // opening the task — the same semantics on every surface.
      await props.onSave({ status: next, needsAttentionSince: null });
      status = next; renderStatusSeg();
      // The strip re-render dropped the pressed button; keep a keyboard user's
      // focus on the strip itself (focus-visible does not light up on a click).
      statusSeg.querySelector<HTMLButtonElement>('button[aria-pressed="true"]')?.focus();
      dirty = title !== props.task.title || description !== props.task.description || projectId !== (props.task.projectId ?? '');
      save.update({ disabled: !dirty });
    } catch (error) { showError(error); }
    finally { busy = false; }
  };
  renderStatusSeg();

  const sessionSection = el('div', 'kb-section'); dialog.append(sessionSection);
  sessionSection.append(el('div', 'kb-section-title', 'OpenCode session'));
  const sessionBody = el('div', 'kb-row'); sessionSection.append(sessionBody);

  // Shown only once a session is linked. The row leads with the session's own
  // title (resolved quietly from the project's session list — a slow, empty,
  // or failed list just keeps displaying the id) with the id under it in mono.
  const renderSessionBody = () => {
    sessionBody.replaceChildren();
    if (!props.task.sessionId) return;
    const sessionId = props.task.sessionId;
    const sessionMain = el('div', 'kb-session-main');
    const sessionTitle = el('div', 'kb-session-title', sessionId);
    sessionMain.append(sessionTitle, el('div', 'kb-mono', sessionId));
    if (props.task.projectId) {
      const wanted = props.task.projectId;
      void props.loadSessionsForProject(wanted).then((sessions) => {
        const found = sessions.find((session) => session.id === sessionId);
        if (found && found.title) sessionTitle.textContent = found.title;
      }, () => undefined);
    }
    sessionBody.append(sessionMain);
    mountButton(sessionBody, {
      label: 'Open Chat',
      onClick: () => { void props.onOpenChat(sessionId).catch(showError); },
    });
    // Unlink sits one accidental click from breaking a live link, so it asks
    // exactly the way Delete does: the first press turns it destructive and
    // says so; the second press does it.
    let confirmingUnlink = false;
    const unlinkButton = mountButton(sessionBody, {
      label: 'Unlink', variant: 'ghost',
      onClick: () => {
        if (!confirmingUnlink) { confirmingUnlink = true; unlinkButton.update({ label: 'Click again to unlink', variant: 'destructive' }); return; }
        void props.onUnlinkSession().catch(showError);
      },
    });
  };
  renderSessionBody();

  // --- Start Agent: shown only before a session is linked, and only where
  // --- the host surface carries it (the board page; the panel does not).
  const startRoot = el('div');
  const pickerRoot = el('div');
  const hasStartAgent = !hasSession && props.onStartAgent != null;
  if (hasStartAgent) sessionSection.append(startRoot);
  sessionSection.append(pickerRoot);
  pickerRoot.hidden = hasSession;

  type StartFromMode = typeof DESTINATION_ROOT | typeof DESTINATION_NEW | 'existing';
  let startFromMode: StartFromMode = DESTINATION_ROOT;
  let existingWorktreeId = '';
  let branchName = '';
  let baseBranchSelection = DEFAULT_BASE_BRANCH_OPTION;
  let startBusy = false;
  let worktreeGeneration = 0;
  let refreshWorktreeOptions = () => {};

  if (hasStartAgent) {
    startRoot.append(el('p', 'kb-muted', 'Starts a real OpenCode session with the description above as its first message, and links it to this task.'));
    const startGrid = el('div', 'kb-dialog-grid'); startRoot.append(startGrid);

    // "Start from" — a radio choice, not a dropdown, same layout as OpenChamber's
    // own New Worktree dialog. "MR or issue" from that dialog has no equivalent
    // here (needs a connected GitLab/Linear account, unrelated to this board).
    const startFromWrap = el('div'); startGrid.append(startFromWrap);
    startFromWrap.append(el('div', 'kb-section-title', 'Start from'));
    const radioGroup = el('div', 'kb-radio-group'); startFromWrap.append(radioGroup);
    const radioName = `kb-start-from-${props.task.id}`;
    const startFromOptions: Array<{ id: StartFromMode; title: string; desc: string }> = [
      { id: DESTINATION_ROOT, title: 'Project root', desc: 'Run directly in the main checkout, no worktree.' },
      { id: DESTINATION_NEW, title: 'New branch', desc: 'A fresh branch and worktree, based on the branch you pick.' },
      { id: 'existing', title: 'Existing worktree', desc: 'Reuse a worktree you already have checked out.' },
    ];
    for (const option of startFromOptions) {
      const optionLabel = el('label', 'kb-radio-option');
      const input = document.createElement('input');
      input.type = 'radio'; input.name = radioName; input.value = option.id; input.checked = option.id === startFromMode;
      const textWrap = el('div');
      textWrap.append(el('div', 'kb-radio-title', option.title), el('div', 'kb-radio-desc', option.desc));
      optionLabel.append(input, textWrap);
      radioGroup.append(optionLabel);
      input.addEventListener('change', () => {
        if (!input.checked) return;
        startFromMode = option.id;
        newBranchFields.hidden = startFromMode !== DESTINATION_NEW;
        existingWorktreeFields.hidden = startFromMode !== 'existing';
        updateStartAgentAvailability();
      });
    }

    const fieldsWrap = el('div'); startGrid.append(fieldsWrap);

    // New branch: name + base branch. The old read-only "Folder name" field is
    // helper text now — the SDK's startSession has one `name` for both, with no
    // way to set a separate folder name independently, and a field that can't
    // be edited says that worse as a line under the field it mirrors.
    const newBranchFields = el('div', 'kb-dialog-grid'); fieldsWrap.append(newBranchFields);
    newBranchFields.hidden = true;
    const branchWrap = el('div'); newBranchFields.append(branchWrap);
    const branchNameField = mountTextField(branchWrap, {
      label: 'Branch name', value: '', placeholder: 'e.g. fix/login-redirect',
      onChange: (value) => {
        branchName = value; branchNameField.update({ value });
        updateStartAgentAvailability();
      },
    });
    branchWrap.append(el('p', 'kb-muted', 'Folder name follows the branch name — this SDK has no way to set a separate folder name.'));
    const baseBranchWrap = el('div'); newBranchFields.append(baseBranchWrap);
    const baseBranchSelect = mountSelect(baseBranchWrap, {
      label: 'Based on', value: baseBranchSelection, options: defaultBaseBranchOptions, searchable: true,
      searchPlaceholder: 'Search branches…',
      onChange: (value) => {
        baseBranchSelection = value; baseBranchSelect.update({ value });
        updateStartAgentAvailability();
      },
    });
    const baseBranchNote = el('p', 'kb-muted kb-span2');
    newBranchFields.append(baseBranchNote);

    // Existing worktree: just pick one. No branch/base-branch fields — reusing an
    // existing worktree doesn't create anything new.
    const existingWorktreeFields = el('div'); fieldsWrap.append(existingWorktreeFields);
    existingWorktreeFields.hidden = true;
    const existingWorktreeSelect = mountSelect(existingWorktreeFields, {
      label: 'Worktree', value: null, placeholder: 'Choose a worktree…', options: [],
      onChange: (value) => { existingWorktreeId = value; existingWorktreeSelect.update({ value }); updateStartAgentAvailability(); },
    });
    const existingWorktreeNote = el('p', 'kb-muted', '');
    existingWorktreeFields.append(existingWorktreeNote);

    const needsBeforeStartNote = el('p', 'kb-muted', '');
    startRoot.append(needsBeforeStartNote);
    // The button itself sits in the footer's slot (created earlier), so the
    // primary and blocking actions of this dialog share one place.
    const canStartAgent = () => {
      if (!projectId || !title.trim() || !description.trim()) return false;
      if (startFromMode === DESTINATION_NEW) {
        if (!branchName.trim()) return false;
        if (branchNameConflictsWithBase(branchName, resolveBaseBranch(baseBranchSelection))) return false;
      }
      if (startFromMode === 'existing') return existingWorktreeId.length > 0;
      return true;
    };
    const startButton = mountButton(startAgentSlot, {
      label: 'Start Agent', disabled: !canStartAgent(),
      onClick: () => {
        void (async () => {
          if (startBusy || !canStartAgent()) return;
          startBusy = true; startButton.update({ loading: true });
          try {
            const destination = startFromMode === 'existing' ? existingWorktreeId : startFromMode;
            const worktree = buildSessionWorktree(destination, branchName, resolveBaseBranch(baseBranchSelection));
            // Whatever is currently typed, saved or not — Start Agent must not silently
            // fall back to the title/description this task had when the popup opened.
            // (The start block only exists when `onStartAgent` was provided.)
            await props.onStartAgent?.({ projectId, worktree, title, description });
          } catch (error) { showError(error); }
          finally { startBusy = false; startButton.update({ loading: false }); }
        })();
      },
    });
    updateStartAgentAvailability = () => {
      const missing: string[] = [];
      if (!projectId) missing.push('choose a project');
      if (!title.trim()) missing.push('give it a title above');
      if (!description.trim()) missing.push('add a description above');
      if (startFromMode === DESTINATION_NEW) {
        if (!branchName.trim()) missing.push('name the new branch');
        else if (branchNameConflictsWithBase(branchName, resolveBaseBranch(baseBranchSelection))) {
          missing.push("pick a different base branch — it can't be the same as the new branch name");
        }
      }
      if (startFromMode === 'existing' && !existingWorktreeId) missing.push('choose a worktree');
      startButton.update({ disabled: missing.length > 0 });
      needsBeforeStartNote.hidden = missing.length === 0;
      if (missing.length > 0) needsBeforeStartNote.textContent = `Before you can start an agent: ${missing.join(', ')}.`;
    };
    updateStartAgentAvailability();

    const noKnownBranchesNote = 'The local branch-lookup service isn\'t approved or available, and this project has no existing worktree to list branches from either — only "Use project default" is available. Approve the service in Settings → Extensions for a searchable branch list.';
    baseBranchNote.textContent = '';
    refreshWorktreeOptions = () => {
      const generation = ++worktreeGeneration;
      baseBranchSelect.update({ value: baseBranchSelection, options: defaultBaseBranchOptions });
      existingWorktreeSelect.update({ value: existingWorktreeId || null, options: [] });
      existingWorktreeNote.textContent = '';
      if (!projectId) { baseBranchNote.textContent = ''; return; }
      void props.loadWorktreeInfo(projectId).then((info) => {
        if (generation !== worktreeGeneration) return;
        existingWorktreeSelect.update({ options: info.destinations.map((w) => ({ id: w.id, label: w.label, hint: w.hint, disabled: w.disabled })) });
        if (info.destinations.length === 0) existingWorktreeNote.textContent = 'No existing worktrees in this project yet.';
        baseBranchSelect.update({ options: info.baseBranches });
        baseBranchNote.textContent = info.hasKnownBranches ? '' : noKnownBranchesNote;
      }, (error) => { if (generation === worktreeGeneration) showError(error); });
    };
    refreshWorktreeOptions();
  }

  let picker: { dispose: () => void } | null = null;
  let pickerGeneration = 0;

  const renderPicker = () => {
    picker?.dispose(); picker = null;
    pickerRoot.replaceChildren();
    if (hasSession) return;
    if (!projectId) { pickerRoot.append(el('p', 'kb-muted', 'Or choose a project above to link an existing session instead.')); return; }
    pickerRoot.append(el('div', 'kb-section-title', 'Or link an existing session'));
    const generation = ++pickerGeneration;
    const list = mountList(pickerRoot, {
      ariaLabel: 'Sessions available to link',
      items: [], emptyText: 'Loading sessions…',
      onSelect: (id) => { void props.onLinkSession(id, projectId || null).catch(showError); },
    });
    picker = list;
    void props.loadSessionsForProject(projectId).then((sessions) => {
      if (generation !== pickerGeneration) return;
      list.update({
        items: sessions.map((s) => ({ id: s.id, title: s.title, subtitle: s.id, badge: sessionBadge(s) })),
        emptyText: 'No sessions in this project yet.',
      });
    }, (error) => { if (generation === pickerGeneration) showError(error); });
  };
  const refreshSessionPicker = () => { renderPicker(); };
  renderPicker();

  dialog.append(errorSlotBottom);
  dialog.appendChild(footer);
  dialog.focus();

  const dispose = () => {
    // Dropping the dialog (save, close, Escape, overlay click, board dispose)
    // must always stop a running capture: the host shows a red
    // "using your microphone" indicator for as long as it's open. discard()
    // also cancels any transcription still in flight. The panel goes first so
    // its level subscription and meter loop never outlive this dialog mount.
    disposeDictationPanel?.();
    props.dictation?.dispose();
    document.removeEventListener('keydown', onKeydown);
    overlay.remove();
  };
  return { dispose };
};
