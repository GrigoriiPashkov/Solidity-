import { loadFixture, ethers, expect } from "./setup";

describe("Payments", function () {
  async function deploy() {
    const [user1, user2] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("Payments");
    const payments = await Factory.deploy();
    await payments.waitForDeployment();
    return { user1, user2, payments };
  }

  it("should be deployed", async function () {
    const { payments } = await loadFixture(deploy);
    expect(payments.target).to.be.properAddress;
  });

  it("should be zero balance", async function () {
    const { payments } = await loadFixture(deploy);
    const balance = await ethers.provider.getBalance(payments.target);
    expect(balance).to.eq(0);
  });

  it("should be possible to send money", async function () {
    const { user1, user2, payments } = await loadFixture(deploy);
    const sum = 100;
    const msg = "message";
    const tx = await payments.connect(user2).pay(msg, { value: sum });
    const receipt = await tx.wait(1);

    await expect(tx).to.changeEtherBalance(user2, -sum);
    const newPayment = await payments.getPayment(user2.address, 0);
    const currentBlock = await ethers.provider.getBlock(
      await ethers.provider.getBlockNumber()
    );

    expect(newPayment.message).to.eq(msg);
    expect(newPayment.amount).to.eq(sum);
    expect(newPayment.from).to.eq(user2.address);
    expect(newPayment.timestamp).to.eq(currentBlock?.timestamp);
  });
});
