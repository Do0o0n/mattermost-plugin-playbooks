// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useUpdateEffect} from 'react-use';
import {useIntl} from 'react-intl';
import styled from 'styled-components';
import {useLocation, useRouteMatch, Redirect} from 'react-router-dom';
import {selectTeam} from 'mattermost-webapp/packages/mattermost-redux/src/actions/teams';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {usePlaybook, useRun, useChannel, useRunMetadata, useRunStatusUpdates} from 'src/hooks';
import {currentBackstageRHS} from 'src/selectors';
import {Role} from 'src/components/backstage/playbook_runs/shared';
import {pluginErrorUrl} from 'src/browser_routing';
import {ErrorPageTypes} from 'src/constants';
import {usePlaybookRunViewTelemetry} from 'src/hooks/telemetry';
import {PlaybookRunViewTarget} from 'src/types/telemetry';
import {BackstageRHSSection, BackstageRHSViewMode} from 'src/types/backstage_rhs';
import {useDefaultRedirectOnTeamChange} from 'src/components/backstage/main_body';
import {openBackstageRHS, toggleBackstageRHS} from 'src/actions';

import Summary from './summary';
import {ParticipantStatusUpdate, ViewerStatusUpdate} from './status_update';
import Checklists from './checklists';
import FinishRun from './finish_run';
import Retrospective from './retrospective';
import {RunHeader} from './header';

const useFollowers = (metadataFollowers: string[]) => {
    const currentUser = useSelector(getCurrentUser);
    const [followers, setFollowers] = useState(metadataFollowers);
    const [isFollowing, setIsFollowing] = useState(followers.includes(currentUser.id));

    useUpdateEffect(() => {
        setFollowers(metadataFollowers);
    }, [currentUser.id, JSON.stringify(metadataFollowers)]);

    useUpdateEffect(() => {
        setIsFollowing(followers.includes(currentUser.id));
    }, [currentUser.id, JSON.stringify(followers)]);

    return {isFollowing, followers, setFollowers};
};

export enum PlaybookRunIDs {
    SectionSummary = 'playbook-run-summary',
    SectionStatusUpdate = 'playbook-run-status-update',
    SectionChecklists = 'playbook-run-checklists',
    SectionRetrospective = 'playbook-run-retrospective',
}

const PlaybookRunDetails = () => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();
    const match = useRouteMatch<{playbookRunId: string}>();
    const playbookRunId = match.params.playbookRunId;
    const {hash: urlHash} = useLocation();
    const retrospectiveMetricId = urlHash.startsWith('#' + PlaybookRunIDs.SectionRetrospective) ? urlHash.substring(1 + PlaybookRunIDs.SectionRetrospective.length) : '';
    const [playbookRun] = useRun(playbookRunId);
    const [playbook] = usePlaybook(playbookRun?.playbook_id);

    usePlaybookRunViewTelemetry(PlaybookRunViewTarget.Details, playbookRun?.id);

    // we must force metadata refetch when participants change (leave&unfollow)
    const [metadata, metadataResult] = useRunMetadata(playbookRunId, [JSON.stringify(playbookRun?.participant_ids)]);
    const followState = useFollowers(metadata?.followers || []);

    const [statusUpdates] = useRunStatusUpdates(playbookRunId, [playbookRun?.status_posts.length]);
    const [channel, channelFetchMetadata] = useChannel(playbookRun?.channel_id ?? '');
    const myUser = useSelector(getCurrentUser);

    const RHS = useSelector(currentBackstageRHS);

    useEffect(() => {
        if (!playbookRun) {
            return;
        }
        const RHSUpdatesOpened = RHS.isOpen && RHS.section === BackstageRHSSection.RunStatusUpdates;
        const emptyUpdates = !playbookRun?.status_update_enabled || playbookRun.status_posts.length === 0;
        if (RHSUpdatesOpened && emptyUpdates) {
            dispatch(toggleBackstageRHS(BackstageRHSSection.RunInfo, BackstageRHSViewMode.Overlap, playbookRun.id));
        } else if (RHS.isOpen) {
            dispatch(openBackstageRHS(RHS.section, BackstageRHSViewMode.Overlap, playbookRun.id));
        }
    }, [playbookRun?.id, playbookRun?.status_update_enabled, playbookRun?.status_posts.length, RHS.section, RHS.isOpen]);

    useEffect(() => {
        const teamId = playbookRun?.team_id;
        if (!teamId) {
            return;
        }
        dispatch(selectTeam(teamId));
    }, [dispatch, playbookRun?.team_id]);

    useDefaultRedirectOnTeamChange(playbookRun?.team_id);

    // When first loading the page, the element with the ID corresponding to the URL
    // hash is not mounted, so the browser fails to automatically scroll to such section.
    // To fix this, we need to manually scroll to the component
    useEffect(() => {
        if (urlHash !== '') {
            setTimeout(() => {
                document.querySelector(urlHash)?.scrollIntoView();
            }, 300);
        }
    }, [urlHash]);

    // loading state
    if (playbookRun === undefined) {
        return null;
    }

    // not found or error
    if (playbookRun === null || metadataResult.error !== null) {
        return <Redirect to={pluginErrorUrl(ErrorPageTypes.PLAYBOOK_RUNS)}/>;
    }

    const role = playbookRun.participant_ids.includes(myUser.id) ? Role.Participant : Role.Viewer;

    return (
        <Container>
            <MainWrapper>
                <Header>
                    <RunHeader
                        playbookRunMetadata={metadata ?? null}
                        playbookRun={playbookRun}
                        role={role}
                        isFollowing={followState.isFollowing}
                        channel={channel}
                        hasAccessToChannel={!channelFetchMetadata.isErrorCode(403)}
                    />
                </Header>
                <Main>
                    <Body>
                        <Summary
                            id={PlaybookRunIDs.SectionSummary}
                            playbookRun={playbookRun}
                            role={role}
                        />
                        {role === Role.Participant ? (
                            <ParticipantStatusUpdate
                                id={PlaybookRunIDs.SectionStatusUpdate}
                                playbookRun={playbookRun}
                            />
                        ) : (
                            <ViewerStatusUpdate
                                id={PlaybookRunIDs.SectionStatusUpdate}
                                lastStatusUpdate={statusUpdates?.length ? statusUpdates[0] : undefined}
                                playbookRun={playbookRun}
                            />
                        )}
                        <Checklists
                            id={PlaybookRunIDs.SectionChecklists}
                            playbookRun={playbookRun}
                            role={role}
                        />
                        <Retrospective
                            id={PlaybookRunIDs.SectionRetrospective}
                            playbookRun={playbookRun}
                            playbook={playbook ?? null}
                            role={role}
                            focusMetricId={retrospectiveMetricId}
                        />
                        {role === Role.Participant ? <FinishRun playbookRun={playbookRun}/> : null}
                    </Body>
                </Main>
            </MainWrapper>
        </Container>
    );
};

export default PlaybookRunDetails;

const RowContainer = styled.div`
    display: flex;
    flex-direction: column;
`;
const ColumnContainer = styled.div`
    display: flex;
    flex-direction: row;
`;

const Container = styled(ColumnContainer)`
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 2fr minmax(400px, 1fr);
    overflow-y: hidden;

    @media screen and (min-width: 1600px) {
        grid-auto-columns: 2.5fr 500px;
    }
`;

const MainWrapper = styled.div`
    display: grid;
    grid-template-rows: 56px 1fr;
    grid-auto-flow: row;
    overflow-y: hidden;
`;

const Main = styled.main`
    min-height: 0;
    padding: 0 20px 60px;
    display: grid;
    overflow-y: auto;
    place-content: start center;
    grid-auto-columns: min(780px, 100%);
`;
const Body = styled(RowContainer)`
`;

const Header = styled.header`
    height: 56px;
    min-height: 56px;
    background-color: var(--center-channel-bg);
`;
