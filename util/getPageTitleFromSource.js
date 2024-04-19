function getPageTitleFromSource(_source) {
  if (!_source) return;
  const source = _source.toLowerCase();
  const splitOnTitleOpen = source.split("<title>");
  if (splitOnTitleOpen?.length !== 2) return;
  const splitOnTitleClose = splitOnTitleOpen[1].split("</title>");
  if (splitOnTitleClose?.length !== 2) return;
  return splitOnTitleClose[0];
}

module.exports = getPageTitleFromSource;
