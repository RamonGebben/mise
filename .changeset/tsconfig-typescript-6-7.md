---
'@pindakaasman/tsconfig': patch
---

Accept TypeScript 6 and 7 as peers (`^5.0.0 || ^6.0.0 || ^7.0.0`), so projects on newer TypeScript - such as Expo SDK 58 on TS 6 - can install it without a peer-dependency conflict.
