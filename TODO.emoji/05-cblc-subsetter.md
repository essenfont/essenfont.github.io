# 05 — CBLCSubsetter strategy

A strategy class that subsets the CBLC table to only BitmapSizeTable /
IndexSubTableArray entries whose GIDs are in the subset.

## Algorithm

1. Read source CBLC
2. For each BitmapSizeTable:
   - Walk its IndexSubTableArray
   - For each IndexSubTable: filter GID range to subset intersection
   - Drop IndexSubTables that have no overlap with subset
   - Update `additionalOffsetToIndexSubtable` to point into new CBDT
3. Drop empty BitmapSizeTables
4. Return rewritten CBLC bytes

## File target

`lib/fontisan/subset/table_strategy/cblc.rb`

## Acceptance

- Subset CBLC only references GIDs in subset
- Each IndexSubTable's `additionalOffsetToIndexSubtable` points into
  the corresponding (subset) CBDT block
- Spec covers a 2-emoji subset
