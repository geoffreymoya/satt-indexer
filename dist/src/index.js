"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const checkpoint_1 = __importStar(require("@snapshot-labs/checkpoint"));
const config_json_1 = __importDefault(require("./config.json"));
const writers_1 = require("./writers");
const checkpoints_json_1 = __importDefault(require("./checkpoints.json"));
const dir = __dirname.endsWith('dist/src') ? '../' : '';
const schemaFile = path_1.default.join(__dirname, `${dir}../src/schema.gql`);
const schema = fs_1.default.readFileSync(schemaFile, 'utf8');
const checkpointOptions = {
    logLevel: checkpoint_1.LogLevel.Info,
    // prettifyLogs: true, // uncomment in local dev
    dbConnection: "mysql://checkpoint:checkpoint@localhost:3306/checkpoint"
};
// Initialize checkpoint
// @ts-ignore
const checkpoint = new checkpoint_1.default(config_json_1.default, writers_1.writers, schema, checkpointOptions);
// resets the entities already created in the database
// ensures data is always fresh on each re-run
checkpoint
    .reset()
    .then(() => checkpoint.seedCheckpoints(checkpoints_json_1.default))
    .then(() => {
    // start the indexer
    checkpoint.start();
});
/*const app = express();
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ limit: '4mb', extended: false }));
app.use(cors({ maxAge: 86400 }));

// mount Checkpoint's GraphQL API on path /
app.use('/', checkpoint.graphql);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));*/ 
