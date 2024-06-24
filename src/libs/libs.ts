import NodeCache from 'node-cache';
import mongoose, { Schema, Types } from 'mongoose';

const nodeCache = new NodeCache({
    stdTTL: 3600, // 3600 giây.
});

export { nodeCache, mongoose, Schema, Types };
