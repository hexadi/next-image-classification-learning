import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
export const GET = async (request: NextRequest, { params }: { params: { path: string[] } }, res: any) => {
    // return NextResponse.json({path: params.path})
    // return file from path
    const filePath = path.join(process.cwd(), 'uploads', ...params.path);
    const file = await fs.promises.readFile(filePath);
    return new Response(file, {
        headers: { 'Content-Type': 'image/' + filePath.split('.').pop() },
    });
}