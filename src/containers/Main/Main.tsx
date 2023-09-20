import { useEffect, useState } from 'react';

import { getDeviceProfile, View } from '@novorender/api';

import { CardComponent } from '../../components';
import { getLoadScene } from '../../helpers';

const INITIAL_CAMERA_POSITION = [10, 10, 10];
const INITIAL_CAMERA_ROTATION = [0, 0, 0, 40];
const INITIAL_CAMERA_KIND = 'pinhole';
const INITIAL_CAMERA_FOV = 30;

export const MainContainer = () => {
	const [view, setView] = useState<View | null>(null);

	const initializeView = async () => {
		try {
			const canvas = document.getElementById('canvas') as HTMLCanvasElement;
			const GPU_TIER = 2;
			const deviceProfile = getDeviceProfile(GPU_TIER);
			const imports = await View.downloadImports({ baseUrl: '/novorender/api/' });
			const newView = new View(canvas, deviceProfile, imports);

			setView(newView);

			const { url } = await getLoadScene();

			const config = await newView.loadSceneFromURL(new URL(url));
			const { center, radius } = config.boundingSphere;
			const { activeController } = newView;

			activeController.autoFit(center, radius);
			activeController.init(activeController.serialize());

			newView.modifyRenderState({
				camera: {
					kind: INITIAL_CAMERA_KIND,
					fov: INITIAL_CAMERA_FOV,
					position: INITIAL_CAMERA_POSITION,
					rotation: INITIAL_CAMERA_ROTATION,
				},
				grid: { enabled: true },
			});

			await newView.run();
			newView.dispose();
		} catch (error) {
			console.error('Error initializing view:', error);
		}
	};

	useEffect(() => {
		initializeView();
	}, []);

	return (
		<>
			<CardComponent projectView={view} />
			<canvas id="canvas" style={{ width: '100%', height: '100vh' }}></canvas>
		</>
	);
};
