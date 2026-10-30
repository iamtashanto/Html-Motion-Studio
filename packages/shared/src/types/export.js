"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportSettingsSchema = void 0;
const zod_1 = require("zod");
exports.ExportSettingsSchema = zod_1.z.object({
    aspectRatio: zod_1.z.enum(['16:9', '9:16', '1:1', '4:5', 'custom']),
    width: zod_1.z.number().int().min(240).max(3840),
    height: zod_1.z.number().int().min(240).max(3840),
    resolution: zod_1.z.enum(['720p', '1080p', '1440p', '4k']),
    fps: zod_1.z.union([zod_1.z.literal(24), zod_1.z.literal(30), zod_1.z.literal(60)]),
    format: zod_1.z.enum(['mp4', 'webm']),
    quality: zod_1.z.enum(['draft', 'standard', 'high', 'ultra']),
    videoBitrateMbps: zod_1.z.number().min(1).max(50),
    audioBitrateKbps: zod_1.z.number().min(64).max(320),
    durationPolicy: zod_1.z.enum(['project', 'audio', 'custom']),
    durationSeconds: zod_1.z.number().min(0.5).max(300), // Max 5 mins for browser safeguard
    loopAnimationIfShorter: zod_1.z.boolean(),
    filename: zod_1.z.string().min(1).max(100),
    engineStrategy: zod_1.z.enum(['auto', 'webcodecs', 'mediarecorder', 'canvas']),
});
