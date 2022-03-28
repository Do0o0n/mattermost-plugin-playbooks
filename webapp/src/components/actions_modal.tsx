// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {useIntl} from 'react-intl';
import {Scrollbars} from 'react-custom-scrollbars';
import {Modal} from 'react-bootstrap';

import styled from 'styled-components';

import {mdiLightningBoltOutline} from '@mdi/js';

import {getCurrentChannelId} from 'mattermost-webapp/packages/mattermost-redux/src/selectors/entities/common';

import Icon from '@mdi/react';

import cloneDeep from 'lodash';

import {fetchChannelActions, saveChannelAction} from 'src/client';
import {hideActionsModal} from 'src/actions';
import {isActionsModalVisible, isCurrentUserChannelAdmin, isCurrentUserAdmin} from 'src/selectors';
import GenericModal, {ModalSubheading, DefaultFooterContainer} from 'src/components/widgets/generic_modal';
import Action from 'src/components/actions_modal_action';
import Trigger from 'src/components/actions_modal_trigger';
import {ChannelAction, ChannelActionType, ActionsByTrigger, ChannelTriggerType, equalActionType} from 'src/types/channel_actions';

const defaultActions: ActionsByTrigger = {
    [ChannelTriggerType.NewMemberJoins]: [
        {
            channel_id: '',
            enabled: false,
            action_type: ChannelActionType.WelcomeMessage,
            trigger_type: ChannelTriggerType.NewMemberJoins,
            payload: {
                message: '',
            },
        },
        {
            channel_id: '',
            enabled: false,
            action_type: ChannelActionType.CategorizeChannel,
            trigger_type: ChannelTriggerType.NewMemberJoins,
            payload: {
                category_name: '',
            },
        },
    ],
    [ChannelTriggerType.KeywordsPosted]: [
        {
            channel_id: '',
            enabled: false,
            action_type: ChannelActionType.PromptRunPlaybook,
            trigger_type: ChannelTriggerType.KeywordsPosted,
            payload: {
                keywords: [],
                playbook_id: '',
            },
        },
    ],
};

const ActionsModal = () => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();
    const show = useSelector(isActionsModalVisible);
    const channelID = useSelector(getCurrentChannelId);
    const isChannelAdmin = useSelector(isCurrentUserChannelAdmin);
    const isSysAdmin = useSelector(isCurrentUserAdmin);

    const editable = isChannelAdmin || isSysAdmin;

    const [actionsChanged, setActionsChanged] = useState(false);
    const [originalActions, setOriginalActions] = useState({} as ActionsByTrigger);
    const [currentActions, setCurrentActions] = useState(defaultActions);

    useEffect(() => {
        const getActions = async (id: string) => {
            const fetchedActions = await fetchChannelActions(id);

            const record = {} as ActionsByTrigger;
            fetchedActions.forEach((action) => {
                const array = record[action.trigger_type];
                if (array) {
                    record[action.trigger_type].push(action);
                } else {
                    record[action.trigger_type] = [action];
                }
            });

            // Merge the fetched actions with the default ones
            Object.entries(record).forEach(([triggerString, actionsInRecord]) => {
                const trigger = triggerString as ChannelTriggerType;
                const finalActions = [] as ChannelAction[];
                defaultActions[trigger].forEach((defaultAction: ChannelAction) => {
                    const actionFetched = actionsInRecord.find((actionInRecord) => equalActionType(actionInRecord, defaultAction));
                    if (actionFetched) {
                        finalActions.push(actionFetched);
                    } else {
                        finalActions.push(defaultAction);
                    }
                });
                record[trigger] = finalActions;
            });

            setOriginalActions(record);
            setCurrentActions({...defaultActions, ...record});
        };

        if (channelID) {
            getActions(channelID);
        }
    }, [channelID]);

    const onHide = () => {
        // Restore the state to the original actions
        setCurrentActions({...defaultActions, ...originalActions});
        dispatch(hideActionsModal());
    };

    const onSave = () => {
        if (!actionsChanged) {
            return;
        }

        const newActions = cloneDeep(currentActions).value();
        const saveActionPromises = [] as Promise<void>[];

        Object.values(newActions).forEach((actions) => {
            actions.forEach((action) => {
                action.channel_id = channelID;
                const promise = saveChannelAction(action).then((newID) => {
                    if (!action.id) {
                        action.id = newID;
                    }
                });
                saveActionPromises.push(promise);
            });
        });

        // Wait until all save calls have ended (successfully or not)
        // before setting both the current and original actions
        Promise.allSettled(saveActionPromises).then(() => {
            setCurrentActions(newActions);
            setOriginalActions(newActions);
        });

        dispatch(hideActionsModal());
    };

    const onUpdateAction = (newAction: ChannelAction) => {
        setActionsChanged(true);

        setCurrentActions((prevActions: ActionsByTrigger) => {
            // TODO: Change this deep cloning
            const newActions = JSON.parse(JSON.stringify(prevActions));

            const idx = prevActions[newAction.trigger_type]?.findIndex((action) => action.action_type === newAction.action_type);
            if (idx !== null) {
                newActions[newAction.trigger_type][idx] = newAction;
            }

            return newActions;
        });
    };

    const header = (
        <Header>
            <ActionsIcon
                path={mdiLightningBoltOutline}
                size={1.6}
            />
            <div>
                {formatMessage({defaultMessage: 'Channel Actions'})}
                <ModalSubheading>
                    {formatMessage({defaultMessage: 'Channel actions allow you to automate activities for this channel'})}
                </ModalSubheading>
            </div>
        </Header>
    );

    return (
        <GenericModal
            id={'channel-actions-modal'}
            modalHeaderText={header}
            show={show}
            onHide={onHide}
            handleCancel={editable ? onHide : null}
            handleConfirm={editable ? onSave : null}
            confirmButtonText={formatMessage({defaultMessage: 'Save'})}
            cancelButtonText={formatMessage({defaultMessage: 'Cancel'})}
            isConfirmDisabled={!editable}
            isConfirmDestructive={false}
            autoCloseOnCancelButton={true}
            autoCloseOnConfirmButton={false}
            enforceFocus={true}
            adjustTop={400}
            components={{
                Header: ModalHeader,
                FooterContainer: ModalFooter,
            }}
        >
            <Scrollbars
                autoHeight={true}
                autoHeightMax={500}
                renderThumbVertical={renderThumbVertical}
                renderTrackVertical={renderTrackVertical}
            >
                <TriggersContainer>
                    {Object.entries(currentActions).map(([trigger, actions]) => (
                        <Trigger
                            key={trigger}
                            editable={editable}
                            triggerType={trigger as ChannelTriggerType}
                            actions={actions}
                            onUpdate={onUpdateAction}
                        >
                            <ActionsContainer>
                                {actions.map((action) => (
                                    <Action
                                        key={action.id}
                                        action={action}
                                        editable={editable}
                                        onUpdate={onUpdateAction}
                                    />
                                ))}
                            </ActionsContainer>
                        </Trigger>
                    ))}
                </TriggersContainer>
            </Scrollbars>
        </GenericModal>
    );
};

const ModalHeader = styled(Modal.Header)`
    :after {
        content: '';
        height: 1px;
        width: 100%;
        position: absolute;
        left: 0px;
        background: rgba(var(--center-channel-color-rgb), 0.08);
    }

    &&&& {
        margin-bottom: 0;
    }
`;

const ModalFooter = styled(DefaultFooterContainer)`
    :after {
        content: '';
        height: 1px;
        width: 100%;
        position: absolute;
        left: 0px;
        margin-top: -24px;

        background: rgba(var(--center-channel-color-rgb), 0.08);
    }
`;

const renderThumbVertical = ({style, ...props}: any) => (
    <div
        {...props}
        style={{
            ...style,
            width: '4px',
            background: 'var(--center-channel-color)',
            opacity: '0.24',
            borderRadius: '4px',
            position: 'fixed',
            right: '8px',
        }}
    />
);

const renderTrackVertical = ({style, ...props}: any) => (
    <div
        {...props}
        style={{
            ...style,
            paddingTop: '8px',
            paddingBottom: '8px',

            // The following three props are needed to actually render the track;
            // without them, the scrollbar disappears
            height: '100%',
            top: '0',
            right: '0',
        }}
    />
);

const Header = styled.div`
    display: flex;
    flex-direction: row;
`;

const ActionsIcon = styled(Icon)`
    color: rgba(var(--center-channel-color-rgb), 0.56);
    margin-right: 14px;
    margin-top: 2px;
`;

const TriggersContainer = styled.div`
    display: flex;
    flex-direction: column;
    row-gap: 16px;
`;

const ActionsContainer = styled.div`
    display: flex;
    flex-direction: column;
    row-gap: 20px;
`;

export default ActionsModal;
