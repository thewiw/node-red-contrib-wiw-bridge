export VERSION=$( grep -Eo "\"version\": \"(\w*.\w*.\w*)" package.json | cut -d\" -f4 )
export MAJOR_VERSION_NB=$( echo "$VERSION" | cut -d. -f1 )
