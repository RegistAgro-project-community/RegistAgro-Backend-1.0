import { paymentSplit, readPaymentSplitPolicy } from "../../src/utils/paymentSplit.js";

describe("configurable payment split", () => {
  it("uses defaults in development and environment policy when configured", () => {
    expect(paymentSplit(100)).toEqual({ transportValue: 30, registagroValue: 5, total: 135 });
    expect(paymentSplit(100, readPaymentSplitPolicy({ PAYMENT_TRANSPORT_PERCENT: "20", PAYMENT_REGISTAGRO_PERCENT: "3" })))
      .toEqual({ transportValue: 20, registagroValue: 3, total: 123 });
  });

  it("rejects invalid policy and invalid transaction values", () => {
    expect(() => readPaymentSplitPolicy({ PAYMENT_TRANSPORT_PERCENT: "90", PAYMENT_REGISTAGRO_PERCENT: "10" })).toThrow();
    expect(() => readPaymentSplitPolicy({ PAYMENT_TRANSPORT_PERCENT: "abc", PAYMENT_REGISTAGRO_PERCENT: "5" })).toThrow();
    expect(() => paymentSplit(-1)).toThrow();
  });
});
