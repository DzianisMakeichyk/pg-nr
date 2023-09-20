import { SceneData, createAPI } from "@novorender/data-js-api";

const SCENE_ID = "95a89d20dd084d9486e383e131242c4c";
const serviceUrl = "https://data.novorender.com/api";

export const getLoadScene = async () => {
	const dataApi = createAPI({ serviceUrl });

	return await dataApi.loadScene(SCENE_ID) as SceneData;
}