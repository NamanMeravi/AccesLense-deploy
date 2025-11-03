import Project from "../models/project.model.js";
import { runAccessibilityCheck } from "../utils/pa11yCheck.js";
//  Get all projects
export const getAllProjects = async (req, res) => {
  try {
    // Only get projects for the authenticated user
    const projects = await Project.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Get most recent project
export const getRecentProject = async (req, res) => {
  try {
    // Only get recent projects for the authenticated user
    const projects = await Project.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);
    if (!projects || projects.length === 0) {
      return res.status(404).json({ success: false, message: "No project found" });
    }
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Search projects (by name, url, description)
export const searchProjects = async (req, res) => {
  try {
    const { query } = req.query; // /search?query=portfolio
    // Only search projects for the authenticated user
    const projects = await Project.find({
      user: req.user._id,
      $or: [
        { name: { $regex: query, $options: "i" } },
        { url: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    });
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Create project
export const createProject = async (req, res) => {
  try {
    const { name, url, description } = req.body;
    if (!name || !url || !description) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Associate project with the authenticated user
    const project = new Project({ 
      name, 
      url, 
      description,
      user: req.user._id 
    });
    await project.save();

    res.status(201).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Update project
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find project and check if it belongs to the user
    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Check if the project belongs to the authenticated user
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You don't have permission to update this project" });
    }

    // Update the project
    const updatedProject = await Project.findByIdAndUpdate(
      id, 
      req.body, 
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({ success: true, project: updatedProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Delete project
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find project and check if it belongs to the user
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Check if the project belongs to the authenticated user
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You don't have permission to delete this project" });
    }

    const deletedProject = await Project.findByIdAndDelete(id);

    res.json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Run accessibility test for a project by ID
export const checkProjectAccessibility = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Run new accessibility audit
    const results = await runAccessibilityCheck(project.url);

    return res.status(200).json({
      success: true,
      project: {
        _id: project._id,
        name: project.name,
        url: project.url,
      },
      results,
    });
  } catch (error) {
    console.error("Accessibility check error:", error);
    return res.status(500).json({
      success: false,
      message: "Accessibility check failed: " + error.message,
    });
  }
};