import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import {
  calculateBudgetPlan,
  findAffordableHotels,
} from "../services/budgetPlanner";
import { BudgetPlanType } from "../shared/types";

const router = express.Router();

router.post(
  "/calculate",
  [
    body("budget").isFloat({ min: 1000 }).withMessage("Budget must be at least ₹1000"),
    body("travelers").isInt({ min: 1 }).withMessage("At least 1 traveler required"),
    body("nights").isInt({ min: 1 }).withMessage("At least 1 night required"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { budget, travelers, nights } = req.body;

      const plan = calculateBudgetPlan(budget, travelers, nights);

      const affordableHotels = await findAffordableHotels(plan.perNightBudget, 10);
      plan.affordableHotels = affordableHotels;

      res.json({ plan });
    } catch (error) {
      console.error("Budget planner error:", error);
      res.status(500).json({ message: "Unable to calculate budget plan" });
    }
  }
);

export default router;
