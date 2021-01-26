import fetch from 'node-fetch';

import { FanPage } from "@/models/fanpage";

const fb = {
  getUserInfo: async (fbUserId: string, fbAccessToken: string): Promise<any> => {
    const response = await fetch(
      `https://graph.facebook.com/v9.0/${fbUserId}?fields=id,email,name&access_token=${fbAccessToken}`,
      {
        method: 'GET'
      });

    return await response.json();
  },
  getUserFanPages: async (fbAccessToken: string): Promise<FanPage[]> => {
    const response = await fetch(
      `https://graph.facebook.com/me/accounts?fields=name,access_token&limit=100&access_token=${fbAccessToken}`,
      {
        method: 'GET'
      });

    return (await response.json()).data.map(page => ({ id: page.id, name: page.name }));
  },
}

export default fb;

