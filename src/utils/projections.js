import proj4 from "proj4";

export const coordinateSystems = [
  {
    id: "EPSG:4326",
    def: "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees",
    name: "WGS 84 -- WGS84 - World Geodetic System 1984, used in GPS",
    url: "https://epsg.io/4326"
  },
  {
    id: "EPSG:32040",
    def: `+proj=lcc +lat_1=28.38333333333333 +lat_2=30.28333333333333 +lat_0=27.83333333333333 +lon_0=-99 +x_0=609601.2192024384 +y_0=0 +datum=NAD27 +units=us-ft +no_defs`, //  eslint-disable-line max-len
    name: "NAD27 / Texas South Central",
    url: "https://epsg.io/32040"
  }
];

proj4.defs(coordinateSystems.map(({ id, def }) => [id, def]));

const wgs84 = proj4.Proj("EPSG:4326");

export const getTransformer = targetProj => sourceProj => coords => {
  return proj4(sourceProj, targetProj, coords);
};
export const toWGS84 = getTransformer(wgs84);
