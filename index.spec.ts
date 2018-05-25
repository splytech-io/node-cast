import { expect } from 'chai';
import { castDocument, castFilter } from './index';

describe('tests', () => {
  class ObjectId {
    public id: string;

    constructor(id: string) {
      this.id = id;
    }
  }

  describe('.castDocument()', () => {
    it('should cast date', () => {
      expect(castDocument({
        created: '2017',
      }, {
        created: Date,
      }).created).to.instanceOf(Date);
    });
    it('should not cast other values', () => {
      expect(castDocument({
        updated: '2017',
      }, {
        created: Date,
      }).updated).to.a('string');
    });
    it('should cast nested values', () => {
      expect(castDocument({
        property: {
          date: '2017',
        },
      }, {
        'property.date': Date,
        'updated': Date,
      }).property.date).to.instanceOf(Date);
    });
    it('should cast array values', () => {
      const result = castDocument({
        dates: ['2016', '2017'],
      }, {
        'dates': Date,
      });

      expect(result.dates[0]).to.instanceOf(Date);
      expect(result.dates[1]).to.instanceOf(Date);
    });
  });
  describe('.castFilter()', () => {
    it('should cast date', () => {
      expect(castFilter({
        'created': '2017',
      }, {
        created: Date,
      }).created).to.instanceOf(Date);
    });
    it('should not cast other values', () => {
      expect(castFilter({
        'property.date': '2017',
      }, {
        'created': Date,
      })['property.date']).to.a('string');
    });
    it('should cast nested values', () => {
      expect(castFilter({
        'property.date': '2017',
      }, {
        'property.date': Date,
      })['property.date']).to.instanceOf(Date);
    });
    it('should cast array', () => {
      expect(castFilter({
        'property.dates': ['2017'],
      }, {
        'property.dates': Date,
      })['property.dates'][0]).to.instanceOf(Date);
    });
    it('should cast object', () => {
      const result = castFilter({
        'property.dates': { $in: ['2017'] },
      }, {
        'property.dates': Date,
      });
      expect(result['property.dates'].$in[0]).to.instanceOf(Date);
    });
    it('should process $and correctly', () => {
      const result = castFilter({
        $and: [{
          '_id': '1',
        }],
      }, {
        '_id': ObjectId,
      });

      expect(result).to.deep.equals({
        $and: [{
          _id: new ObjectId('1'),
        }],
      });
    });
    it('should process $in inside $and correctly', () => {
      const result = castFilter({
        $and: [{
          '_id': { $in: ['1', '2'] },
        }],
      }, {
        '_id': ObjectId,
      });

      expect(result).to.deep.equals({
        $and: [{
          _id: { $in: [new ObjectId('1'), new ObjectId('2')] },
        }],
      });
    });
    it('should process $nin correctly', () => {
      const result = castFilter({
        _id: {
          $nin: ['1', '2'],
        },
      }, {
        '_id': ObjectId,
      });

      expect(result).to.deep.equals({
        _id: {
          $nin: [new ObjectId('1'), new ObjectId('2')],
        },
      });
    });
    it('should process $or in $and correctly', () => {
      const result = castFilter({
        $and: [{
          'one': '2017',
          '$or': [{
            _id: '1',
          }, {
            _id: '2',
          }],
        }],
      }, {
        '_id': ObjectId,
        'one': Date,
      });

      expect(result).to.deep.equals({
        $and: [{
          one: new Date('2017'),
          $or: [{
            _id: new ObjectId('1'),
          }, {
            _id: new ObjectId('2'),
          }],
        }],
      });
    });
    it('should process $eq and $ne correctly', () => {
      const result = castFilter({
        'references.partner_ids': {
          '$or': [
            { '$eq': '5a81a609b1896756c1288f48' },
            { '$ne': ['5a81a609b1896756c1288f48'] },
          ],
        },
      }, {
          'references.partner_ids': ObjectId,
        });

      expect(result).to.deep.equals({
        'references.partner_ids': {
          '$or': [
            { '$eq': new ObjectId('5a81a609b1896756c1288f48') },
            { '$ne': [new ObjectId('5a81a609b1896756c1288f48')] },
          ],
        },
      });
    });
    it('should process $lte, $gte correctly', () => {
      const result = castFilter({
        '$and': [
          { 'created': { '$lte': '2018-03-31T22:59:59.999Z', '$gte': '2018-03-01T00:00:00.000Z' } },
        ],
      }, {
          'created': Date,
        });

      expect(result).to.deep.equals({
        '$and': [
          {
            'created': {
              '$lte': new Date('2018-03-31T22:59:59.999Z'),
              '$gte': new Date('2018-03-01T00:00:00.000Z')
            },
          },
        ],
      });
    });
  });
});
