import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  getAllProjects,
  getRecentProject,
  searchProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.js";

const router = express.Router();

// GET all projects
router.get("/get", isAuthenticated, getAllProjects);

// GET most recent project
router.get("/recent", isAuthenticated, getRecentProject);

// GET projects by search (name, url, description)
router.get("/search", isAuthenticated, searchProjects);

// POST create project
router.post("/create", isAuthenticated, createProject);

// PATCH update project
router.patch("/update/:id", isAuthenticated, updateProject);

// DELETE project
router.delete("/delete/:id", isAuthenticated, deleteProject);



export default router;
