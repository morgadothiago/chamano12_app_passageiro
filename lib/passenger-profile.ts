import { api } from "./api-client";
import type { PassengerProfile, UpdateAddressData } from "@/types/passenger-profile";

export const passengerProfileService = {
  async getMe(token: string): Promise<PassengerProfile> {
    return api.get<PassengerProfile>("/passengers/me", token);
  },

  async updateMe(data: UpdateAddressData, token: string): Promise<PassengerProfile> {
    return api.patch<PassengerProfile>("/passengers/me", data, token);
  },

  async uploadAvatar(
    file: { uri: string; name: string; mimeType: string },
    token: string,
  ): Promise<PassengerProfile> {
    const formData = new FormData();
    formData.append("file", { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob);
    return api.postFormData<PassengerProfile>("/passengers/me/avatar", formData, token);
  },
};
