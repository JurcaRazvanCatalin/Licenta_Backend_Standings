const express = require("express");
const collectionService = require("./Service");
const Teams = require("./Model");
const { StatusCodes } = require("http-status-codes");
const teamsRouter = express.Router();

const getAllTeams = async (req, res) => {
  const teams = await Teams.find({});
  res.status(StatusCodes.OK).json({ teams });
};

const getTeam = async (req, res) => {
  const { smallTeamName: smallTeamName } = req.params;
  const task = await Teams.findOne({ smallTeamName: smallTeamName });
  res.status(StatusCodes.OK).json({ task });
};

const deleteTeam = async (req, res) => {
  const { smallTeamName: smallTeamName } = req.params;
  const task = await Teams.findOneAndDelete({ smallTeamName: smallTeamName });
  res.status(StatusCodes.OK).json({ task });
};

teamsRouter.route("/create-standings").get(getAllTeams);
teamsRouter
  .route("/create-standings/:smallTeamName")
  .get(getTeam)
  .delete(deleteTeam);

module.exports = teamsRouter;
