#!/bin/bash

versionFile=./version.sh

if [[ -x "${versionFile}" ]] ; then
  . "${versionFile}"
else
  echo "Cannot find ${versionFile} file!" 1>&2 ; exit 1
fi

docker build --pull --build-arg "VERSION=${VERSION}" --tag node-red-wiw:v${VERSION} --tag node-red-wiw:v${MAJOR_VERSION_NB} --tag node-red-wiw:latest ./
