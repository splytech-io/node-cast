# MongoDB Document Caster

## examples

### Cast Document

```typescript
import { ObjectID } from 'bson';
import { castDocument } from '@splytech-io/cast';

const schema = {
  _id: ObjectID,
  'references.user_id': ObjectID,
  'created': Date,
  'updated': Date,
};

const doc = castDocument({
  _id: 'a2b4c6789012345678901234',
  name: 'string',
  references: {
    user_id: 'a2b4c6789012345678901234',
  },
  created: '2017',
  updated: '2018',
}, schema);

console.assert(doc.created instanceof Date);
console.assert(doc._id instanceof ObjectID);
console.assert(typeof doc.name === 'string');
```

### Cast Filter

```typescript
import { castDocument } from '@splytech-io/cast';

const schema = {
  'references.date': Date,
};

const doc = castFilter({
  'references.date': '2017',
  'name': 'John',
}, schema);

console.assert(doc['references.date'] instanceof Date);

MognoDB.collection.findOne(doc);
```
