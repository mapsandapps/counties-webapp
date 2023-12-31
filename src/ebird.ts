import { currentMonth, currentMonthName } from "./utils";

const currentCountyLinksEl = document.querySelector<HTMLElement>(
  "#current-county-links"
);

export const getEbirdLifeListLink = function (county) {
  return `https://ebird.org/lifelist/US-${county.STUSPS}-${county.COUNTYFP}?time=life&r=US-${county.STUSPS}-${county.COUNTYFP}&sortKey=taxon_order&o=asc`;
};

export const getEbirdTargetsLink = function (county) {
  return `https://ebird.org/targets?region=${county.Name}%2C+${county.STATE_NAME}%2C+United+States+%28US%29&r1=US-${county.STUSPS}-${county.COUNTYFP}&bmo=${currentMonth}&emo=${currentMonth}&r2=US-${county.STUSPS}-${county.COUNTYFP}&t2=life&mediaType=`;
};

export const setCurrentCountyLinks = function (county) {
  if (!currentCountyLinksEl) return;

  currentCountyLinksEl.style.display = "block";

  const lifeListUrl = getEbirdLifeListLink(county);
  const targetsUrl = getEbirdTargetsLink(county);

  currentCountyLinksEl.innerHTML = `You are in ${county.NAMELSAD}:<br /><a href="${lifeListUrl}" target="_new">eBird Life List</a><br /><a href="${targetsUrl}" target="_new">eBird Targets for ${currentMonthName}</a>`;
};

export const resetCurrentCountyLinks = function () {
  if (!currentCountyLinksEl) return;

  currentCountyLinksEl.style.display = "none";

  currentCountyLinksEl.innerHTML = "";
};
