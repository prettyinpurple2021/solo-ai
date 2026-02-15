
import { boardroomSessions, boardroomMessages } from "../../../server/db/schema";
import { getTableConfig } from "drizzle-orm/pg-core";

describe("Boardroom Schema", () => {
  it("should define boardroomSessions table", () => {
    expect(boardroomSessions).toBeDefined();
    const config = getTableConfig(boardroomSessions);
    expect(config.name).toBe("boardroom_sessions");
  });

  it("should define boardroomMessages table", () => {
    expect(boardroomMessages).toBeDefined();
    const config = getTableConfig(boardroomMessages);
    expect(config.name).toBe("boardroom_messages");
  });
});
