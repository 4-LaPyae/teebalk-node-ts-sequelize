export enum GeometryTypeEnum {
  POINT = 'Point',
  GEOMETRY = 'Geometry',
  LINESTRING = 'LineString',
  POLYGON = 'Polygon',
  MULTIPOINT = 'MultiPoint',
  MULTILINESTRING = 'MultiLineString',
  MULTIPOLYGON = 'MultiPolygon',
  GEOMETRYCOLLECTION = 'GeometryCollection'
}

export interface IGeometry {
  type: GeometryTypeEnum;
  coordinates: [number, number];
}
