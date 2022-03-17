///<reference types="Cypress"/>

describe("Testing travel insurance on Booking Page", () => {
  function getBookingToken() {
    return cy
      .request({
        method: "GET",
        url: "https://api.skypicker.com/flights",
        qs: {
          partner: "sgtestertasktesting",
          fly_from: "BTS",
          fly_to: "STN",
          limit: 1,
        },
      })
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data).length.to.be.greaterThan(0);
        let bookingToken = response.body.data[0].booking_token;
        return bookingToken;
      });
  }

  function getCheckBoxes() {
    cy.get("[data-test=ReservationPassengerInsurance-content-insurance-type]", {
      timeout: 10000,
    })
      .find("input")
      .then((list) => {
        cy.wrap(list[0]).as("travelPlus");
        cy.wrap(list[1]).as("travelBasic");
        cy.wrap(list[2]).as("noInsurance");
      });
  }
  const checkboxes = ["@travelBasic", "@noInsurance", "@travelBasic"];

  beforeEach(() => {
    getBookingToken().then((bookingToken) => {
      cy.visit("https://www.kiwi.com/booking", {
        qs: {
          token: bookingToken,
        },
      });
    });
    //Handle cookie modal pop-up
    cy.get("button").contains("Accept").click();
  });

  it("user should be able to add Travel Plus insurance", () => {
    getCheckBoxes();
    cy.get("[data-test=ReservationPassengerInsurance-content-insurance-type]")
      .eq(0)
      .find("p")
      .should("have.text", "Travel Plus");
    cy.get(".dghLmL > :nth-child(1)").find("ul > li").should("have.length", 6);
    checkboxes.forEach((checkbox) => {
      cy.get(checkbox).should("not.be.checked");
    });
    cy.get("@travelPlus").check({ force: true });
    cy.get(".InsuranceToggleStatus__Container-sc-1fqekzp-0").within(() => {
      cy.get("span").eq(0).should("have.text", "Travel Plus");
      cy.get("span").eq(1).should("have.text", " successfully added.");
    });
    cy.get("[data-test='bookingBillInsurance']")
      .invoke("text")
      .should("include", "Travel insurance");
    cy.get("a").contains("Change").click();
    cy.get("@travelPlus").should("be.checked");
    cy.get("@travelBasic").should("not.be.checked");
    cy.get("@noInsurance").should("not.be.checked");
  });

  it("user should be able to add Travel Basic insurance ", () => {
    getCheckBoxes();
    cy.get("[data-test=ReservationPassengerInsurance-content-insurance-type]")
      .eq(1)
      .find("p")
      .should("have.text", "Travel Basic");
    cy.get(".dghLmL > :nth-child(2)").find("ul > li").should("have.length", 3);
    checkboxes.forEach((checkbox) => {
      cy.get(checkbox).should("not.be.checked");
    });
    cy.get("@travelBasic").check({ force: true });
    cy.get(".InsuranceToggleStatus__Container-sc-1fqekzp-0").within(() => {
      cy.get("span").eq(0).should("have.text", "Travel Basic");
      cy.get("span").eq(1).should("have.text", " successfully added.");
    });
    cy.get("[data-test=bookingBillInsurance]")
      .invoke("text")
      .should("include", "Travel insurance");
    cy.get("a").contains("Change").click();
    cy.get("@travelBasic").should("be.checked");
    cy.get("@travelPlus").should("not.be.checked");
    cy.get("@noInsurance").should("not.be.checked");
  });

  it("user should be able to select No insurance option", () => {
    getCheckBoxes();
    cy.get("[data-test=ReservationPassengerInsurance-content-insurance-type]")
      .eq(2)
      .find("p")
      .should("have.text", "No insurance");
    checkboxes.forEach((checkbox) => {
      cy.get(checkbox).should("not.be.checked");
    });
    cy.get("@noInsurance").check({ force: true });
    cy.get("[data-test=bookingBillInsurance]").should("not.exist");
  });

  it("US citizen user should be able to add Travel Plus insurance", () => {
    const personalData = {
      address: "1600 Washington Avenue",
      city: "San Diego",
      state: "California",
      zip: 93102,
    };

    cy.get("[data-test=ReservationPassenger-nationality]", {
      timeout: 10000,
    }).select("us");
    cy.get(".dSaIti > :nth-child(1)")
      .invoke("text")
      .should("contain", "Travel Plus");
    cy.get(".dSaIti > :nth-child(1)").find("li").should("have.length", 5);
    cy.get("[data-test='none']").should("not.be.checked");

    cy.get("[data-test=plus]").should("not.be.checked").check({ force: true });
    cy.get(".InsuranceToggleStatus__Container-sc-1jn0d6s-0")
      .invoke("text")
      .should("contain", "Travel Insurance successfully added.");
    cy.get("[data-test='bookingBillInsurance']")
      .invoke("text")
      .should("include", "Travel insurance");

    //Checking form inputs
    cy.get("input[name='axaUS.streetAddress']")
      .type(personalData.address, { force: true })
      .should("have.attr", "value", personalData.address);
    cy.get("input[name='axaUS.city']")
      .type(personalData.city, { force: true })
      .should("have.attr", "value", personalData.city);
    cy.get("[data-test=us-states-list]").select(personalData.state, {
      force: true,
    });
    cy.get("input[name='axaUS.zipCode']")
      .type(personalData.zip, { force: true })
      .should("have.attr", "value", personalData.zip);

    cy.get("a").contains("Change").click({ force: true });
    cy.get("[data-test=plus]").should("be.checked");
    cy.get("[data-test='none']").should("not.be.checked");
  });

  it("user should be able to add Travel Plus insurance via Comparison and terms pop up", () => {
    cy.get("[data-test=ReservationPassengerInsurance-head-infoButton]", {
      timeout: 10000,
    }).click();
    cy.get(".Modal__ModalBody-sc-15ie1vv-0", { timeout: 10000 }).should(
      "be.visible"
    );
    cy.get("[data-test=plus-modalButton]").click({
      force: true,
      multiple: true,
    });
    cy.get(".InsuranceToggleStatus__Container-sc-1fqekzp-0").within(() => {
      cy.get("span").eq(0).should("have.text", "Travel Plus");
      cy.get("span").eq(1).should("have.text", " successfully added.");
    });
    cy.get("[data-test='bookingBillInsurance']")
      .invoke("text")
      .should("include", "Travel insurance");
  });

  it("user should be able to add Travel Basic insurance via Comparison and terms pop up", () => {
    cy.get("[data-test=ReservationPassengerInsurance-head-infoButton]", {
      timeout: 10000,
    }).click();
    cy.get(".Modal__ModalBody-sc-15ie1vv-0", { timeout: 10000 }).should(
      "be.visible"
    );
    cy.get("[data-test=basic-modalButton]").click({
      force: true,
      multiple: true,
    });
    cy.get(".InsuranceToggleStatus__Container-sc-1fqekzp-0").within(() => {
      cy.get("span").eq(0).should("have.text", "Travel Basic");
      cy.get("span").eq(1).should("have.text", " successfully added.");
    });
    cy.get("[data-test=bookingBillInsurance]")
      .invoke("text")
      .should("include", "Travel insurance");
  });

  it("user should be able to change selected Travel Plus insurace for Travel Basic via Comparison and Terms pop up", () => {
    getCheckBoxes();
    cy.get("@travelPlus").should("not.be.checked").check({ force: true });
    cy.get(".InsuranceToggleStatus__Container-sc-1fqekzp-0").within(() => {
      cy.get("span").eq(0).should("have.text", "Travel Plus");
      cy.get("span").eq(1).should("have.text", " successfully added.");
    });
    cy.get("[data-test='bookingBillInsurance']")
      .invoke("text")
      .should("include", "Travel insurance");
    cy.get("[data-test=ReservationPassengerInsurance-head-infoButton]").click();
    cy.get(".Modal__ModalBody-sc-15ie1vv-0", { timeout: 10000 }).should(
      "be.visible"
    );
    cy.get("[data-test=basic-modalButton]").click({
      force: true,
      multiple: true,
    });
    cy.get(".InsuranceToggleStatus__Container-sc-1fqekzp-0").within(() => {
      cy.get("span").eq(0).should("have.text", "Travel Basic");
      cy.get("span").eq(1).should("have.text", " successfully added.");
    });
    cy.get("[data-test=bookingBillInsurance]")
      .invoke("text")
      .should("include", "Travel insurance");
  });

  it("user should be able to change selected Travel Basic insurace for Travel Plus via Comparison and Terms pop up", () => {
    getCheckBoxes();
    cy.get("@travelBasic").should("not.be.checked").check({ force: true });
    cy.get(".InsuranceToggleStatus__Container-sc-1fqekzp-0").within(() => {
      cy.get("span").eq(0).should("have.text", "Travel Basic");
      cy.get("span").eq(1).should("have.text", " successfully added.");
    });
    cy.get("[data-test='bookingBillInsurance']")
      .invoke("text")
      .should("include", "Travel insurance");
    cy.get("[data-test=ReservationPassengerInsurance-head-infoButton]").click();
    cy.get(".Modal__ModalBody-sc-15ie1vv-0", { timeout: 10000 }).should(
      "be.visible"
    );
    cy.get("[data-test=plus-modalButton]").click({
      force: true,
      multiple: true,
    });
    cy.get(".InsuranceToggleStatus__Container-sc-1fqekzp-0").within(() => {
      cy.get("span").eq(0).should("have.text", "Travel Plus");
      cy.get("span").eq(1).should("have.text", " successfully added.");
    });
    cy.get("[data-test=bookingBillInsurance]")
      .invoke("text")
      .should("include", "Travel insurance");
  });
});
