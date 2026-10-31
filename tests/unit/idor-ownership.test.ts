import { TransportModel } from "../../src/model/transport.model.js";
import { LocationModel } from "../../src/model/location.model.js";
import { FlowModel } from "../../src/model/flow.model.js";

jest.mock("../../lib/prisma.js", () => ({ prisma: {
  farms: { findFirst: jest.fn() }, carriers: { findFirst: jest.fn() }, consumers: { findFirst: jest.fn() },
  users: { findFirst: jest.fn() }, orders: { findFirst: jest.fn(), update: jest.fn() },
  transport_requests: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
  vehicles: { findFirst: jest.fn() }, location: { findFirst: jest.fn(), updateMany: jest.fn(), create: jest.fn() },
  payments: { findFirst: jest.fn() }, products: { update: jest.fn() },
} }));
jest.mock("../../src/services/location.service.js", () => ({ getAdress: jest.fn(), getAltLong: jest.fn() }));
jest.mock("../../src/services/payment.service.js", () => ({ Payments: class {} }));

const db = jest.requireMock("../../lib/prisma.js").prisma as Record<string, Record<string, jest.Mock>>;

describe("IDOR ownership filters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not hire a carrier for an order owned by another farm", async () => {
    db.farms.findFirst.mockResolvedValue({ id: "farm-A" });
    db.transport_requests.findFirst.mockResolvedValue(null);
    db.orders.findFirst.mockResolvedValue(null);
    const result = await new TransportModel().hireCarrier("user-A", "order-B", "vehicle-B");
    expect(result.info).toBeDefined();
    expect(db.transport_requests.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ orderId: "order-B", order: { farmId: "farm-A" } }) }));
    expect(db.orders.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ id: "order-B", farmId: "farm-A" }) }));
    expect(db.transport_requests.create).not.toHaveBeenCalled();
  });

  it("scopes carrier directions to that carrier's request", async () => {
    db.carriers.findFirst.mockResolvedValue({ id: "carrier-A" });
    db.transport_requests.findFirst.mockResolvedValue(null);
    const result = await new LocationModel().getDirection("carrier-user-A", "request-B");
    expect(result.info).toBeDefined();
    expect(db.transport_requests.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ id: "request-B", carrierId: "carrier-A" }) }));
  });

  it("scopes tracking coordinates to the authenticated consumer", async () => {
    db.users.findFirst.mockResolvedValue({ id: "consumer-A", status: "active" });
    db.orders.findFirst.mockResolvedValue(null);
    const result = await new LocationModel().getLocation("consumer-A", "order-B");
    expect(result.info).toBeDefined();
    expect(db.orders.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ id: "order-B", consumer: { consumerId: "consumer-A" } }) }));
  });

  it("scopes farm flow to that farm's own order", async () => {
    db.farms.findFirst.mockResolvedValue({ id: "farm-A" });
    db.orders.findFirst.mockResolvedValue(null);
    const result = await new FlowModel().startFlow("farm-user-A", "order-B");
    expect(result.info).toBeDefined();
    expect(db.orders.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ id: "order-B", farmId: "farm-A" }) }));
    expect(db.orders.update).not.toHaveBeenCalled();
  });

  it("scopes delivery completion to the authenticated carrier", async () => {
    db.carriers.findFirst.mockResolvedValue({ id: "carrier-A" });
    db.transport_requests.findFirst.mockResolvedValue(null);
    const result = await new FlowModel().finishFlow("carrier-user-A", "request-B");
    expect(result.info).toBeDefined();
    expect(db.transport_requests.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ id: "request-B", carrierId: "carrier-A" }) }));
    expect(db.transport_requests.update).not.toHaveBeenCalled();
  });

  it("scopes order completion to the authenticated consumer", async () => {
    db.consumers.findFirst.mockResolvedValue({ id: "consumer-A" });
    db.orders.findFirst.mockResolvedValue(null);
    db.transport_requests.findFirst.mockResolvedValue(null);
    const result = await new FlowModel().completeOrder("consumer-user-A", "order-B");
    expect(result.info).toBeDefined();
    expect(db.orders.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ id: "order-B", consumerId: "consumer-A" }) }));
  });
});
