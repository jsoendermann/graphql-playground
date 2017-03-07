const Koa = require('koa');
const Router = require('koa-router'); // koa-router@7.x
const convert = require('koa-convert');
const graphqlHTTP = require('koa-graphql');
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
} = require('graphql');
const { MongoClient } = require('mongodb');
const assert = require('assert')




const app = new Koa();
const router = new Router();


const roll = () => Math.floor(6 * Math.random()) + 1
const queryType = new GraphQLObjectType({
  name: 'RootQuery',
  fields: {
    hello: {
      type: GraphQLString,
      resolve: () => 'world'
    },
    diceRoll: {
      type: new GraphQLList(GraphQLInt),
      args: {
        count: {
          type: GraphQLInt,
          defaultValue: 2
        }
      },
      resolve: (_, args) => {
        return Array(args.count).fill(roll).map(f => f())
      }
    },
    usersCount: {
      type: GraphQLInt,
      resolve: (_, args, { db }) => {
        return db.collection('users').count()
      }
    }
  }
})

const schema = new GraphQLSchema({
  query: queryType,
})




MongoClient.connect('mongodb://localhost:27017/test', (err, db) => {
  assert.equal(null, err)
  console.log(`Connected to db`)

  router.all('/graphql', convert(graphqlHTTP({
    schema,
    graphiql: true,
    context: { db },
  })));

  app.use(router.routes()).use(router.allowedMethods());

  app.listen(3080)
})