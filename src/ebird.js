import { currentMonth, currentMonthName } from "./utils";

const ebirdLinksEl = document.querySelector("#ebird-links");
const ebirdLifeLinkEl = document.querySelector("#ebird-life");
const ebirdTargetsLinkEl = document.querySelector("#ebird-targets");

export const getEbirdLifeListLink = function (county) {
  return `https://ebird.org/lifelist/US-${county.STUSPS}-${county.COUNTYFP}?time=life&r=US-${county.STUSPS}-${county.COUNTYFP}&sortKey=taxon_order&o=asc`;
};

export const getEbirdTargetsLink = function (county) {
  return `https://ebird.org/targets?region=${county.Name}%2C+${county.STATE_NAME}%2C+United+States+%28US%29&r1=US-${county.STUSPS}-${county.COUNTYFP}&bmo=${currentMonth}&emo=${currentMonth}&r2=US-${county.STUSPS}-${county.COUNTYFP}&t2=life&mediaType=`;
};

export const setEbirdLinks = function (county) {
  ebirdLinksEl.style.display = "block";

  const lifeListUrl = getEbirdLifeListLink(county);
  const targetsUrl = getEbirdTargetsLink(county);

  ebirdLifeLinkEl.href = lifeListUrl;
  ebirdLifeLinkEl.innerText = `Life list for ${county.NAMELSAD}`;

  ebirdTargetsLinkEl.href = targetsUrl;
  ebirdTargetsLinkEl.innerText = `Targets for ${county.NAMELSAD} for ${currentMonthName}`;
};

export const resetEbirdLinks = function () {
  ebirdLinksEl.style.display = "none";

  ebirdLifeLinkEl.href = "";
  ebirdLifeLinkEl.innerText = "";

  ebirdTargetsLinkEl.href = "";
  ebirdTargetsLinkEl.innerText = "";
};
