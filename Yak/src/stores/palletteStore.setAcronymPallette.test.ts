import { describe, it, expect } from "vitest";
import { readFileSync } from 'fs';
import { join } from 'path';

describe('App.vue - setAcronymPallette call site', () => {
    it('should pass a string to setAcronymPallette, not an array', () => {
        const source = readFileSync(
            join(process.cwd(), 'src/App.vue'),
            'utf-8'
        );

        expect(source).not.toMatch(/setAcronymPallette\(.*\.split\(/);
    });
});
