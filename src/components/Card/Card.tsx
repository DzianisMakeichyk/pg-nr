import { MouseEvent, useState } from 'react';
import { Badge, Button, Card, Divider, Input, Space, notification } from 'antd';

import { type RenderStateHighlightGroups, createNeutralHighlight } from '@novorender/api';

import { CameraPositionTypes } from '../../containers';

import { CardComponentProps, ShowNotificationProps } from './Card.types';
import { getLoadScene } from '../../helpers';

const { Search } = Input;

export const CardComponent = ({ projectView }: CardComponentProps) => {
	const [cameraPositions, setCameraPositions] = useState<CameraPositionTypes[] | []>([]);

	const [api, contextHolder] = notification.useNotification();

	const showNotification = ({ message, description, type = 'info' }: ShowNotificationProps) => {
		api[type]({
			message,
			description,
			placement: 'top',
			duration: 2,
		});
	};

	const onSaveScenePosition = async ({ shiftKey }: MouseEvent<HTMLElement>, index: number) => {
		if (!projectView) {
			showNotification({ message: 'Ops', description: 'No view', type: 'error' });
			return;
		}

		const flightController = await projectView.switchCameraController('flight');

		// Save
		if (shiftKey) {
			const { position, rotation } = projectView.renderState.camera;
			const savedPositions = [...cameraPositions];

			const newCameraPositions = {
				position: [...position],
				rotation: [...rotation],
			};

			savedPositions[index] = newCameraPositions;

			setCameraPositions(savedPositions);

			showNotification({ message: 'Position saved successfully!', description: '', type: 'success' });
			// Set
		} else {
			const savedPosition = cameraPositions[index];

			if (!savedPosition || !flightController) {
				showNotification({
					message: 'No position saved',
					description: 'To save postion use "shift + left click" & click on button',
					type: 'warning',
				});

				return;
			}

			await flightController.moveTo(new Float32Array(savedPosition.position), 1000, new Float32Array(savedPosition.rotation));
		}
	};

	const onSearch = async (value: string) => {
		if (!projectView) {
			showNotification({ message: 'Ops', description: 'No view', type: 'error' });
			return;
		}

		try {
			const { db } = await getLoadScene();

			if (!db) return;

			const { signal } = new AbortController();
			const iterator = db.search(
				{
					searchPattern: [{ property: 'name', value, exact: false }],
				},
				signal
			);

			const result: number[] = [];

			for await (const object of iterator) {
				result.push(object.id);
			}

			if (result.length <= 0) {
				showNotification({ message: 'Ops', description: `No result for "${value}"` });
			}

			const renderStateHighlightGroups: RenderStateHighlightGroups = {
				defaultAction: 'hide',
				groups: [{ action: createNeutralHighlight(), objectIds: result }],
			};

			result.length !== 0
				? projectView.modifyRenderState({
						highlights: renderStateHighlightGroups,
				  })
				: null;
		} catch (error) {
			console.error('Error:', error);
		}
	};

	const generatePositionButtons = (length: number) => {
		return Array.from({ length }, (_, index) => (
			<Badge key={`btn-${index}`} dot={!!cameraPositions[index]}>
				<Button block size="large" className="btn" onClick={(event) => onSaveScenePosition(event, index)}>
					Position {index + 1}
				</Button>
			</Badge>
		));
	};

	return (
		<Card style={{ width: 375, position: 'absolute', top: '5vh', left: '50%', transform: 'translateX(-50%)' }}>
			{contextHolder}
			<div className="container">
				<div className="buttons-wrapper">
					<Space direction="vertical" style={{ width: '100%' }}>
						<Space wrap>{generatePositionButtons(3)}</Space>
					</Space>
				</div>
				<Divider plain />
				<Search placeholder="Input search text" onSearch={onSearch} enterButton size="large" />
			</div>
		</Card>
	);
};
