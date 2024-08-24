// methods to handle socket events - used for non GM clients to request the GM client to take actions they're not allowed

import moduleJson from '@module';
import { getGame, isClientGM } from './game';

const eventName = `module.${moduleJson.id}`;

export enum SOCKET_REQUESTS {
  updateSceneWeather = 'updateSceneWeather'
}

type SimpleWeatherRequest = {
  action: SOCKET_REQUESTS;
  data: any;
}

export const requestGMAction = async (request: SOCKET_REQUESTS, data: any): Promise<void> => {
  return new Promise(resolve => {
    getGame().socket?.emit(eventName, {
      action: request,
      data: data,
    }, response => {
      resolve(response);
    });
  });
}

export const loadSocketHandler = () => {
  getGame().socket?.on(eventName, async (request: SimpleWeatherRequest, ack) => {
    if (!isClientGM())
      return;

    const response = { success: false };

    switch (request.action as SOCKET_REQUESTS) {
      // update the scene weather
      // data is the effect name to set on the scene weather
      case SOCKET_REQUESTS.updateSceneWeather:

        if (request?.data?.toString()) {
          await getGame().scenes?.active?.update({ weather: request.data.toString() });
          response.success = true;
        }
        
        break;
      
      default:
    }

    // send the response
    ack(response);
  })
}