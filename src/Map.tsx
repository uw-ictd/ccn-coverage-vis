import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import * as d3 from 'd3';
import sites from './sites.json';
import data from './data-small.json';
import SiteMarker, { isSiteMarkerProps, SiteMarkerProps } from './SiteMarker';
import MeasurementPoint from './MeasurementPoint';
import { ScaleSequential } from 'd3';
import { MapType } from './MapSelectionRadio';

const DEFAULT_POSITION: [number, number] = [47.44846, -122.29217];

const ATTRIBUTION = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, ' +
  'under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. ' +
  'Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, ' +
  'under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.';

const URL = `https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}${devicePixelRatio > 1 ? "@2x" : ""}.png`;

function isSiteMarkerPropsArray(sites: any[]): sites is SiteMarkerProps[] {
  return sites.every(isSiteMarkerProps);
}

interface MapProps {
  mapType: MapType;
  selectedSites: SidebarOption[];
}

const Map = (props: MapProps) => {
  const [colorScale, setColorScale] = useState<ScaleSequential<string, never>>(
    () =>
      d3
        .scaleSequentialLog(d3.interpolateInferno)
        .domain([
          d3.max(data, d => d.ping) ?? 1,
          d3.min(data, d => d.ping) ?? 0,
        ]),
  );

  if (!isSiteMarkerPropsArray(sites)) {
    throw new Error('data has incorrect type');
  }

  useEffect(() => {
    setColorScale(() =>
      d3
        .scaleSequentialLog(d3.interpolateInferno)
        .domain([
          d3.max(data, d => d[props.mapType]) ?? 1,
          d3.min(data, d => d[props.mapType]) ?? 0,
        ]),
    );
  }, [props.mapType]);

  const selectedSites = props.selectedSites.map(ss => ss.label);

  return (
    <MapContainer
      style={{ height: 600, width: 1000 }}
      center={DEFAULT_POSITION}
      zoom={10}
    >
      <TileLayer attribution={ATTRIBUTION} url={URL} opacity={0.5} />
      {sites
        .filter(site => selectedSites.includes(site.name))
        .map(site => (
          <SiteMarker key={site.name} {...site} />
        ))}
      {data
        .filter(datum => selectedSites.includes(datum.site))
        .map(datum => (
          <MeasurementPoint
            key={`${datum.device_id}-${datum.timestamp}`}
            {...datum}
            color={colorScale(datum[props.mapType])}
          />
        ))}
    </MapContainer>
  );
};

export default Map;
