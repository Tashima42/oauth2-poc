import { IClientRepository } from "../../IClientRepository";
import { Client } from "../../../entities/Client";
import { PostgresDatabase } from "./index";

export class PostgresClientRepository implements IClientRepository {
  constructor(private postgresDatabase: PostgresDatabase) { }

  async create(client: Client): Promise<Client> {
    const created = await this.postgresDatabase.client.query(`INSERT INTO client 
        (name, client_id, client_secret, redirect_uris) 
        VALUES (?, ?, ?, ?)`,
      client.getName(),
      client.getClientId(),
      client.getClientSecret(),
      client.getRedirectUris().join("|%s|"),
    )
    client.setId(created.lastID)
    return client
  }

  async getByClientId(client_id: string): Promise<Client> {
    const clientFound = await this.postgresDatabase.client.get(`SELECT 
            name, client_id, client_secret, redirect_uris, grants, id
      FROM client
      WHERE client_id = ?;`,
      client_id,
    )
    if (!clientFound) throw { code: "RS-IS-SE-CT-001", message: "Client not found" }
    const client = new Client(
      clientFound.name,
      clientFound.client_id,
      clientFound.client_secret,
      clientFound.redirect_uris ? clientFound.redirect_uris.split("|%s|") : undefined,
      clientFound.id,
    )
    return client
  }
}
