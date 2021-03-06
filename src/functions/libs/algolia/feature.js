const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const algoliasearch = require('algoliasearch');
const db = require('../../database/mongodb');
const Feature = require('../../models/feature');

const applicationID = process.env.ALGOLIA_APPLICATION_ID;
const adminAPIKey = process.env.ALGOLIA_ADMIN_API_KEY;
const indexName = 'feature';

module.exports = async (id) => {
  const record = await Feature.findById(id);
  const {
    name,
    type,
    source,
    foreignKey,
    city,
    state,
    country,
    meta,
    geoJson,
  } = record;
  const { geometry } = geoJson.features[0];
  const { coordinates, type: geoJsonType } = geometry;
  let geoLoc = {};
  if (geoJsonType === 'Point') {
    geoLoc = { lat: coordinates[1], lng: coordinates[0] };
  } else {
    geoLoc = coordinates.map((coordinate) => ({ lat: coordinate[1], lng: coordinate[0] }));
  }
  const client = algoliasearch(applicationID, adminAPIKey);
  const index = client.initIndex(indexName);
  let object = {
    objectID: id,
    name,
    type,
    source,
    foreignKey,
    city,
    state,
    country,
    meta,
    _geoloc: geoLoc,
  };
  if (geoJsonType === 'Point') {
    object = {
      ...object,
      geometry,
    };
  }

  await index
    .setSettings({
      attributesForFaceting: [
        'searchable(type)',
      ],
      searchableAttributes: [
        'type',
      ],
    })
    .catch((err) => {
      console.log(err);
    });
  await index
    .saveObject({
      ...object,
    })
    .then(({ objectID }) => {
      console.log(objectID);
    })
    .catch((err) => {
      console.log(err);
    });
  return true;
};
