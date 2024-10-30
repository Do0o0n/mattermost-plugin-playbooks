// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export interface Playbook {
    id: string;
    title: string;
    description: string;
    team_id: string;
    create_public_playbook_run: boolean;
    delete_at: number;
    run_summary_template_enabled: boolean;
    public: boolean;
    default_owner_id: string;
    default_owner_enabled: boolean;

    /** @alias num_checklists */
    num_stages: number;
    num_steps: number;
    num_runs: number;
    num_actions: number;
    last_run_at: number;
    members: PlaybookMember[];
    default_playbook_member_role: string;
    active_runs: number;
}

export interface PlaybookMember {
    user_id: string
    roles: string[]
    scheme_roles?: string[]
}

export interface PlaybookWithChecklist extends Playbook {
    checklists: Checklist[];
    reminder_message_template: string;
    reminder_timer_default_seconds: number;
    status_update_enabled: boolean;
    invited_user_ids: string[];
    invited_group_ids: string[];
    invite_users_enabled: boolean;
    default_owner_id: string;
    default_owner_enabled: boolean;
    broadcast_channel_ids: string[];
    webhook_on_creation_urls: string[];
    webhook_on_status_update_urls: string[];
    webhook_on_status_update_enabled: boolean;
    message_on_join: string;
    message_on_join_enabled: boolean;
    retrospective_reminder_interval_seconds: number;
    retrospective_template: string;
    retrospective_enabled: boolean
    signal_any_keywords_enabled: boolean;
    signal_any_keywords: string[];
    category_name: string;
    categorize_channel_enabled: boolean;
    run_summary_template: string;
    channel_name_template: string;
    metrics: Metric[];
    is_favorite: boolean;
    create_channel_member_on_new_participant: boolean;
    remove_channel_member_on_removed_participant: boolean;

    channel_mode: string;
    channel_id: string;

    // Deprecated: preserved for backwards compatibility with v1.27
    broadcast_enabled: boolean;
    webhook_on_creation_enabled: boolean;
}

import {MetricType} from 'src/graphql/generated/graphql';

export {MetricType};

export interface Metric {
    id: string;
    type: MetricType;
    title: string;
    description: string;
    target?: number | null;
}

export interface FetchPlaybooksParams {
    team_id?: string;
    page?: number;
    per_page?: number;
    sort?: 'title' | 'stages' | 'steps' | 'runs' | 'last_run_at' | 'active_runs';
    direction?: 'asc' | 'desc';
    search_term?: string;
    with_archived?: boolean;
}

export interface FetchPlaybooksReturn {
    total_count: number;
    page_count: number;
    has_more: boolean;
    items: Playbook[];
}

export interface Checklist {
    title: string;
    items: ChecklistItem[];
}

export enum ChecklistItemState {
    Open = '',
    InProgress = 'in_progress',
    Closed = 'closed',
    Skip = 'skipped',
}

export interface ChecklistItem {
    id?: string;
    title: string;
    description: string;
    state: ChecklistItemState | string;
    state_modified: number;
    assignee_id: string;
    assignee_modified: number;
    command: string;
    command_last_run: number;
    due_date: number;
    task_actions: TaskAction[];
}

export interface TaskAction {
    trigger: Trigger;
    actions: Action[];
}

export interface Trigger {
    type: string;
    payload: string;
}

export interface Action {
    type: string;
    payload: string;
}

export interface DraftPlaybookWithChecklist extends Omit<PlaybookWithChecklist, 'id'> {
    id?: string;
}

// setPlaybookDefaults fills in a playbook with defaults for any fields left empty.
export const setPlaybookDefaults = (playbook: DraftPlaybookWithChecklist) => ({
    ...playbook,
    title: playbook.title.trim() || 'Untitled playbook',
    checklists: playbook.checklists.map((checklist) => ({
        ...checklist,
        title: checklist.title || 'Untitled checklist',
        items: checklist.items.map((item) => ({
            ...item,
            title: item.title || 'Untitled task',
        })),
    })),
});

export function emptyPlaybook(): DraftPlaybookWithChecklist {
    return {
        title: '',
        description: '',
        team_id: '',
        public: true,
        create_public_playbook_run: false,
        delete_at: 0,
        num_stages: 0,
        num_steps: 0,
        num_runs: 0,
        num_actions: 0,
        last_run_at: 0,
        checklists: [emptyChecklist()],
        members: [],
        reminder_message_template: '',
        reminder_timer_default_seconds: 7 * 24 * 60 * 60, // 7 days
        status_update_enabled: true,
        invited_user_ids: [],
        invited_group_ids: [],
        invite_users_enabled: false,
        default_owner_id: '',
        default_owner_enabled: false,
        broadcast_channel_ids: [],
        broadcast_enabled: true,
        webhook_on_creation_urls: [],
        webhook_on_creation_enabled: false,
        webhook_on_status_update_urls: [],
        webhook_on_status_update_enabled: true,
        message_on_join: defaultMessageOnJoin,
        message_on_join_enabled: false,
        retrospective_reminder_interval_seconds: 0,
        retrospective_template: defaultRetrospectiveTemplate,
        retrospective_enabled: true,
        signal_any_keywords: [],
        signal_any_keywords_enabled: false,
        category_name: '',
        categorize_channel_enabled: false,
        run_summary_template_enabled: false,
        run_summary_template: '',
        channel_name_template: '',
        default_playbook_member_role: '',
        metrics: [],
        is_favorite: false,
        active_runs: 0,
        create_channel_member_on_new_participant: true,
        remove_channel_member_on_removed_participant: true,
        channel_id: '',
        channel_mode: 'create_new_channel',
    };
}

export function emptyChecklist(): Checklist {
    return {
        title: 'Default checklist',
        items: [emptyChecklistItem()],
    };
}

export function emptyChecklistItem(): ChecklistItem {
    return {
        title: '',
        state: ChecklistItemState.Open,
        command: '',
        description: '',
        command_last_run: 0,
        due_date: 0,
        task_actions: [] as TaskAction[],
        state_modified: 0,
        assignee_modified: 0,
        assignee_id: '',
    };
}

export const newChecklistItem = (title = '', description = '', command = '', state = ChecklistItemState.Open): ChecklistItem => ({
    title,
    description,
    command,
    command_last_run: 0,
    state,
    due_date: 0,
    task_actions: [] as TaskAction[],
    state_modified: 0,
    assignee_modified: 0,
    assignee_id: '',
});

export interface ChecklistItemsFilter extends Record<string, boolean> {
    all: boolean;
    checked: boolean;
    skipped: boolean;
    me: boolean;
    unassigned: boolean;
    others: boolean;
    overdueOnly: boolean;
}

export const ChecklistItemsFilterDefault: ChecklistItemsFilter = {
    all: false,
    checked: true,
    skipped: true,
    me: true,
    unassigned: true,
    others: true,
    overdueOnly: false,
};

export const newMetric = (type: MetricType, title = '', description = '', target = null): Metric => ({
    id: '',
    type,
    title,
    description,
    target,
});

export const defaultMessageOnJoin = `Welcome! This channel was automatically created as part of a playbook run. You can [learn more about playbooks here](https://docs.mattermost.com/guides/playbooks.html). To see information about this run, such as current owner and checklist of tasks, select the shield icon in the channel header.

Here are some resources that you may find helpful:
[Mattermost community channel](https://community.mattermost.com/core/channels/developers-playbooks)
[User guide and documentation](https://docs.mattermost.com/guides/playbooks.html)`;

export const defaultRetrospectiveTemplate = `### الملخص
يجب أن يحتوي هذا القسم على 2-3 جمل تقدم للقارئ نظرة عامة حول ما حدث، وما كان السبب، وما الذي تم عمله. كلما كان أقصر كان أفضل، لأن هذا ما ستنظر إليه الفرق المستقبلية أولاً للمرجعية.

### ما كان التأثير؟
يصف هذا القسم تأثير تنفيذ هذا الدليل كما شعر به العملاء الداخليون والخارجيون وكذلك أصحاب المصلحة.

### ما هي العوامل المساهمة؟
قد يكون هذا الدليل بروتوكولًا تفاعليًا لموقف غير مرغوب فيه. إذا كان هذا هو الحال، يشرح هذا القسم الأسباب التي أدت إلى حدوث الموقف في المقام الأول. قد تكون هناك عدة أسباب جذرية - وهذا يساعد أصحاب المصلحة على فهم السبب.

### ما الذي تم عمله؟
يشرح هذا القسم كيفية تعاون الفريق خلال الحدث لتحقيق النتيجة. سيساعد ذلك الفرق المستقبلية على التعلم من هذه التجربة فيما يمكنهم تجربته.

### ماذا تعلمنا؟
يجب أن يتضمن هذا القسم آراء الجميع الذين شاركوا للاحتفاء بالنجاحات وتحديد مجالات التحسين. على سبيل المثال: ما الذي سار بشكل جيد؟ ما الذي لم يسِر بشكل جيد؟ ما الذي يجب عمله بشكل مختلف في المرة القادمة؟

### المهام اللاحقة
يُدرج هذا القسم العناصر التي تحوّل الدروس المستفادة إلى تغييرات تساعد الفريق على أن يصبح أكثر كفاءة في التكرارات. يمكن أن يتضمن تعديل الدليل، نشر المراجعة، أو تحسينات أخرى. أفضل المهام اللاحقة ستكون لها مالك واضح وكذلك تاريخ استحقاق.

### أبرز أحداث الخط الزمني
هذا القسم هو سجل منسق يوضح أهم اللحظات. يمكن أن يحتوي على اتصالات رئيسية، لقطات شاشة، أو أي مستندات أخرى. استخدم ميزة الخط الزمني المدمجة لمساعدتك على إعادة تتبع وإعادة عرض تسلسل الأحداث.`;
