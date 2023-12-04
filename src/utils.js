const today = new Date();

export const currentMonth = today.getMonth() + 1;

// prettier-ignore
const monthNames = [
  "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
];
export const currentMonthName = monthNames[today.getMonth()];

const getCountySource = (map) => {
  let countySource;

  map.getLayers().forEach((layer) => {
    if (layer.getProperties().name === "counties") {
      countySource = layer.getSource();
    }
  });

  return countySource;
};

export const getCountyAtCoordinate = (map, coordinate) => {
  const countySource = getCountySource(map);

  return countySource.getFeaturesAtCoordinate(coordinate)[0];
};
