import { contactSchema, designRequestSchema, registerSchema } from "@/lib/validation";

describe("Papa Sami Studio validation", () => {
  it("accepts strong registration details", () => {
    expect(registerSchema.safeParse({ name: "Ada", email: "ada@example.com", password: "Design123" }).success).toBe(true);
  });

  it("rejects weak design requests", () => {
    expect(designRequestSchema.safeParse({ serviceId: "", title: "x", requirements: "short", deadline: "2020-01-01", budget: 1 }).success).toBe(false);
  });

  it("accepts valid contact messages", () => {
    expect(contactSchema.safeParse({ name: "Ada", email: "ada@example.com", subject: "Project", message: "I need a brand kit." }).success).toBe(true);
  });
});
