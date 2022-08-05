// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {Team} from '@mattermost/types/teams';
import {Channel} from '@mattermost/types/channels';

import {PlaybookRun} from 'src/types/playbook_run';
import {RHSState} from 'src/types/rhs';
import {BackstageRHSSection, BackstageRHSViewMode} from 'src/types/backstage_rhs';
import {
    RECEIVED_TOGGLE_RHS_ACTION,
    ReceivedToggleRHSAction,
    SET_RHS_OPEN,
    SetRHSOpen,
    SET_CLIENT_ID,
    SetClientId,
    PLAYBOOK_RUN_CREATED,
    PlaybookRunCreated,
    RECEIVED_PLAYBOOK_RUNS,
    ReceivedPlaybookRuns,
    RECEIVED_TEAM_PLAYBOOK_RUNS,
    ReceivedTeamPlaybookRuns,
    SetRHSState,
    SET_RHS_STATE,
    RemovedFromChannel,
    PlaybookRunUpdated,
    PLAYBOOK_RUN_UPDATED,
    REMOVED_FROM_CHANNEL,
    ReceivedGlobalSettings,
    RECEIVED_GLOBAL_SETTINGS,
    ShowPostMenuModal,
    HidePostMenuModal,
    SHOW_POST_MENU_MODAL,
    HIDE_POST_MENU_MODAL,
    ShowChannelActionsModal,
    SHOW_CHANNEL_ACTIONS_MODAL,
    HIDE_CHANNEL_ACTIONS_MODAL,
    ShowRunActionsModal,
    HideRunActionsModal,
    SHOW_RUN_ACTIONS_MODAL,
    HIDE_RUN_ACTIONS_MODAL,
    SetHasViewedChannel,
    SET_HAS_VIEWED_CHANNEL,
    SetRHSAboutCollapsedState,
    SET_RHS_ABOUT_COLLAPSED_STATE,
    SetChecklistCollapsedState,
    SetAllChecklistsCollapsedState,
    SET_CHECKLIST_COLLAPSED_STATE,
    SET_ALL_CHECKLISTS_COLLAPSED_STATE,
    SetEveryChecklistCollapsedState,
    SET_EVERY_CHECKLIST_COLLAPSED_STATE,
    SetChecklistItemsFilter,
    SET_CHECKLIST_ITEMS_FILTER,
    OPEN_BACKSTAGE_RHS,
    OpenBackstageRHS,
    TOGGLE_BACKSTAGE_RHS,
    ToggleBackstageRHS,
    CLOSE_BACKSTAGE_RHS,
    CloseBackstageRHS,
} from 'src/types/actions';
import {GlobalSettings} from 'src/types/settings';
import {ChecklistItemsFilter} from 'src/types/playbook';

function toggleRHSFunction(state = null, action: ReceivedToggleRHSAction) {
    switch (action.type) {
    case RECEIVED_TOGGLE_RHS_ACTION:
        return action.toggleRHSPluginAction;
    default:
        return state;
    }
}

function rhsOpen(state = false, action: SetRHSOpen) {
    switch (action.type) {
    case SET_RHS_OPEN:
        return action.open || false;
    default:
        return state;
    }
}

function clientId(state = '', action: SetClientId) {
    switch (action.type) {
    case SET_CLIENT_ID:
        return action.clientId || '';
    default:
        return state;
    }
}

function rhsState(state = RHSState.ViewingPlaybookRun, action: SetRHSState) {
    switch (action.type) {
    case SET_RHS_STATE:
        return action.nextState;
    default:
        return state;
    }
}

type TStateMyPlaybookRuns = Record<PlaybookRun['id'], PlaybookRun>;

/**
 * @returns a map of playbookRunId -> playbookRun for all playbook runs for which the current user
 * is a playbook run member.
 * @remarks
 * It is lazy loaded on team change, but will also track incremental updates as provided by websocket events.
 */
const myPlaybookRuns = (
    state: TStateMyPlaybookRuns = {},
    action: PlaybookRunCreated | PlaybookRunUpdated | ReceivedTeamPlaybookRuns | RemovedFromChannel
): TStateMyPlaybookRuns => {
    switch (action.type) {
    case PLAYBOOK_RUN_CREATED: {
        const playbookRunCreatedAction = action as PlaybookRunCreated;
        const playbookRun = playbookRunCreatedAction.playbookRun;
        return {
            ...state,
            [playbookRun.id]: playbookRun,
        };
    }

    case PLAYBOOK_RUN_UPDATED: {
        const playbookRunUpdated = action as PlaybookRunUpdated;
        const playbookRun = playbookRunUpdated.playbookRun;
        return {
            ...state,
            [playbookRun.id]: playbookRun,
        };
    }

    case RECEIVED_PLAYBOOK_RUNS: {
        const receivedPlaybookRunsAction = action as ReceivedPlaybookRuns;
        const playbookRuns = receivedPlaybookRunsAction.playbookRuns;
        if (playbookRuns.length === 0) {
            return state;
        }

        const newState = {
            ...state,
        };

        for (const playbookRun of playbookRuns) {
            newState[playbookRun.id] = playbookRun;
        }

        return newState;
    }

    case RECEIVED_TEAM_PLAYBOOK_RUNS: {
        const receivedTeamPlaybookRunsAction = action as ReceivedTeamPlaybookRuns;
        const playbookRuns = receivedTeamPlaybookRunsAction.playbookRuns;
        if (playbookRuns.length === 0) {
            return state;
        }

        const newState = {
            ...state,
        };

        for (const playbookRun of playbookRuns) {
            newState[playbookRun.id] = playbookRun;
        }

        return newState;
    }

    // TODO: REMOVED_FROM_CHANNEL
    // case REMOVED_FROM_CHANNEL: {
    //     const removedFromChannelAction = action as RemovedFromChannel;
    //     const channelId = removedFromChannelAction.channelId;

    //     const newState = {
    //         ...state,
    //         [teamId]: {...state[teamId]},
    //     };
    //     const runMap = newState[teamId];
    //     if (runMap) {
    //         delete runMap[channelId];
    //     }
    //     return newState;
    // }

    default:
        return state;
    }
};

type TStateMyPlaybookRunsByTeam = Record<Team['id'], null | Record<Channel['id'], PlaybookRun>>;

/**
 * @returns a map of teamId->{channelId->playbookRuns} for which the current user is a playbook run member
 * @remarks
 * It is lazy loaded on team change, but will also track incremental updates as provided by websocket events.
 */
const myPlaybookRunsByTeam = (
    state: TStateMyPlaybookRunsByTeam = {},
    action: PlaybookRunCreated | PlaybookRunUpdated | ReceivedTeamPlaybookRuns | RemovedFromChannel
): TStateMyPlaybookRunsByTeam => {
    switch (action.type) {
    case PLAYBOOK_RUN_CREATED: {
        const playbookRunCreatedAction = action as PlaybookRunCreated;
        const playbookRun = playbookRunCreatedAction.playbookRun;
        const teamId = playbookRun.team_id;
        return {
            ...state,
            [teamId]: {
                ...state[teamId],
                [playbookRun.channel_id]: playbookRun,
            },
        };
    }
    case PLAYBOOK_RUN_UPDATED: {
        const playbookRunUpdated = action as PlaybookRunUpdated;
        const playbookRun = playbookRunUpdated.playbookRun;
        const teamId = playbookRun.team_id;
        return {
            ...state,
            [teamId]: {
                ...state[teamId],
                [playbookRun.channel_id]: playbookRun,
            },
        };
    }
    case RECEIVED_TEAM_PLAYBOOK_RUNS: {
        const receivedTeamPlaybookRunsAction = action as ReceivedTeamPlaybookRuns;
        const playbookRuns = receivedTeamPlaybookRunsAction.playbookRuns;
        if (playbookRuns.length === 0) {
            return state;
        }
        const teamId = playbookRuns[0].team_id;
        const newState = {
            ...state,
            [teamId]: {
                ...state[teamId],
            },
        };

        for (const playbookRun of playbookRuns) {
            const tx = newState[teamId];
            if (tx) {
                tx[playbookRun.channel_id] = playbookRun;
            }
        }

        return newState;
    }
    case REMOVED_FROM_CHANNEL: {
        const removedFromChannelAction = action as RemovedFromChannel;
        const channelId = removedFromChannelAction.channelId;
        const teamId = Object.keys(state).find((t) => Boolean(state[t]?.[channelId]));
        if (!teamId) {
            return state;
        }

        const newState = {
            ...state,
            [teamId]: {...state[teamId]},
        };
        const runMap = newState[teamId];
        if (runMap) {
            delete runMap[channelId];
        }
        return newState;
    }
    default:
        return state;
    }
};

const globalSettings = (state: GlobalSettings | null = null, action: ReceivedGlobalSettings) => {
    switch (action.type) {
    case RECEIVED_GLOBAL_SETTINGS:
        return action.settings;
    default:
        return state;
    }
};

const postMenuModalVisibility = (state = false, action: ShowPostMenuModal | HidePostMenuModal) => {
    switch (action.type) {
    case SHOW_POST_MENU_MODAL:
        return true;
    case HIDE_POST_MENU_MODAL:
        return false;
    default:
        return state;
    }
};

const channelActionsModalVisibility = (state = false, action: ShowChannelActionsModal) => {
    switch (action.type) {
    case SHOW_CHANNEL_ACTIONS_MODAL:
        return true;
    case HIDE_CHANNEL_ACTIONS_MODAL:
        return false;
    default:
        return state;
    }
};

const runActionsModalVisibility = (state = false, action: ShowRunActionsModal | HideRunActionsModal) => {
    switch (action.type) {
    case SHOW_RUN_ACTIONS_MODAL:
        return true;
    case HIDE_RUN_ACTIONS_MODAL:
        return false;
    default:
        return state;
    }
};

const hasViewedByChannel = (state: Record<string, boolean> = {}, action: SetHasViewedChannel) => {
    switch (action.type) {
    case SET_HAS_VIEWED_CHANNEL:
        return {
            ...state,
            [action.channelId]: action.hasViewed,
        };
    default:
        return state;
    }
};

const rhsAboutCollapsedByChannel = (state: Record<string, boolean> = {}, action: SetRHSAboutCollapsedState) => {
    switch (action.type) {
    case SET_RHS_ABOUT_COLLAPSED_STATE:
        return {
            ...state,
            [action.channelId]: action.collapsed,
        };
    default:
        return state;
    }
};

// checklistCollapsedState keeps a map of channelId -> checklist number -> collapsed
const checklistCollapsedState = (
    state: Record<string, Record<number, boolean>> = {},
    action:
    | SetChecklistCollapsedState
    | SetAllChecklistsCollapsedState
    | SetEveryChecklistCollapsedState
) => {
    switch (action.type) {
    case SET_CHECKLIST_COLLAPSED_STATE: {
        const setAction = action as SetChecklistCollapsedState;
        return {
            ...state,
            [setAction.key]: {
                ...state[setAction.key],
                [setAction.checklistIndex]: setAction.collapsed,
            },
        };
    }
    case SET_ALL_CHECKLISTS_COLLAPSED_STATE: {
        const setAction = action as SetAllChecklistsCollapsedState;
        const newState: Record<number, boolean> = {};
        for (let i = 0; i < setAction.numOfChecklists; i++) {
            newState[i] = setAction.collapsed;
        }
        return {
            ...state,
            [setAction.key]: newState,
        };
    }
    case SET_EVERY_CHECKLIST_COLLAPSED_STATE: {
        const setAction = action as SetEveryChecklistCollapsedState;
        return {
            ...state,
            [setAction.key]: setAction.state,
        };
    }
    default:
        return state;
    }
};

const checklistItemsFilterByChannel = (state: Record<string, ChecklistItemsFilter> = {}, action: SetChecklistItemsFilter) => {
    switch (action.type) {
    case SET_CHECKLIST_ITEMS_FILTER:
        return {
            ...state,
            [action.key]: action.nextState,
        };
    default:
        return state;
    }
};

// Backstage RHS related reducer
// Note That this is not the same as channel RHS management
// TODO: make a refactor with some naming change now we have multiple RHS
//       inside playbooks (channels RHS, Run details page RHS, backstage RHS)
export type backstageRHSState = {
    isOpen: boolean;
    viewMode: BackstageRHSViewMode;
    section: BackstageRHSSection;
    resourceId: string;
}
const initialBackstageRHSState = {
    isOpen: false,
    viewMode: BackstageRHSViewMode.Overlap,
    section: BackstageRHSSection.TaskInbox,
    resourceId: '',
};

const backstageRHS = (state: backstageRHSState = initialBackstageRHSState, action: OpenBackstageRHS | CloseBackstageRHS | ToggleBackstageRHS) => {
    switch (action.type) {
    case OPEN_BACKSTAGE_RHS: {
        const openAction = action as OpenBackstageRHS;
        return {isOpen: true, viewMode: openAction.viewMode, section: openAction.section, resourceId: openAction.resourceId};
    }
    case TOGGLE_BACKSTAGE_RHS: {
        const toggleAction = action as ToggleBackstageRHS;
        if (state.section === toggleAction.section && state.resourceId === toggleAction.resourceId) {
            return {...state, isOpen: !state.isOpen};
        }
        return {isOpen: true, viewMode: toggleAction.viewMode, section: toggleAction.section, resourceId: toggleAction.resourceId};
    }
    case CLOSE_BACKSTAGE_RHS:
        return {...state, isOpen: false};
    default:
        return state;
    }
};

const reducer = combineReducers({
    toggleRHSFunction,
    rhsOpen,
    clientId,
    myPlaybookRuns,
    myPlaybookRunsByTeam,
    rhsState,
    globalSettings,
    postMenuModalVisibility,
    channelActionsModalVisibility,
    runActionsModalVisibility,
    hasViewedByChannel,
    rhsAboutCollapsedByChannel,
    checklistCollapsedState,
    checklistItemsFilterByChannel,
    backstageRHS,
});

export default reducer;

export type PlaybooksPluginState = ReturnType<typeof reducer>;
