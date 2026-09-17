import { TMDBService } from "./tmdb";
import { ActorDetails } from "../types";

export class ActorService {
  public static async getDetails(id: number, language: string = 'en-US'): Promise<ActorDetails> {
    return TMDBService.fetchEndpoint<ActorDetails>(`person/${id}`, {
      language,
      append_to_response: "combined_credits",
    });
  }
}
