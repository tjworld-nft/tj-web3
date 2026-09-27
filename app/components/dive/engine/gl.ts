/** WebGL2 の最小限のヘルパー（ライブラリを使わない） */

export type Program = {
    program: WebGLProgram;
    uniforms: Map<string, WebGLUniformLocation | null>;
    u: (name: string) => WebGLUniformLocation | null;
};

function compileShader(gl: WebGL2RenderingContext, type: number, source: string, label: string) {
    const shader = gl.createShader(type);
    if (!shader) throw new Error(`[dive] createShader failed: ${label}`);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

function shaderError(gl: WebGL2RenderingContext, shader: WebGLShader, source: string, label: string) {
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null;
    const log = gl.getShaderInfoLog(shader) ?? "";
    const numbered = source
        .split("\n")
        .map((l, i) => `${String(i + 1).padStart(4)}: ${l}`)
        .join("\n");
    return `[dive] shader compile error (${label})\n${log}\n${numbered}`;
}

/**
 * プログラムを作る。コンパイルとリンクの結果はすぐには確かめない（check() で確かめる）。
 * KHR_parallel_shader_compile があれば、GPU 側でコンパイルしている間にメインスレッドを止めずに済む。
 */
export function createProgram(
    gl: WebGL2RenderingContext,
    vs: string,
    fs: string,
    label: string,
    attribs: Record<string, number> = {}
): Program & { check: () => void; ready: (ext: unknown) => boolean } {
    const program = gl.createProgram();
    if (!program) throw new Error(`[dive] createProgram failed: ${label}`);
    const v = compileShader(gl, gl.VERTEX_SHADER, vs, `${label}.vs`);
    const f = compileShader(gl, gl.FRAGMENT_SHADER, fs, `${label}.fs`);
    gl.attachShader(program, v);
    gl.attachShader(program, f);
    for (const [name, loc] of Object.entries(attribs)) gl.bindAttribLocation(program, loc, name);
    gl.linkProgram(program);

    const uniforms = new Map<string, WebGLUniformLocation | null>();
    const u = (name: string) => {
        if (!uniforms.has(name)) uniforms.set(name, gl.getUniformLocation(program, name));
        return uniforms.get(name) ?? null;
    };
    let checked = false;
    const check = () => {
        if (checked) return;
        checked = true;
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const err =
                shaderError(gl, v, vs, `${label}.vs`) ??
                shaderError(gl, f, fs, `${label}.fs`) ??
                `[dive] link error (${label}): ${gl.getProgramInfoLog(program)}`;
            throw new Error(err);
        }
        gl.deleteShader(v);
        gl.deleteShader(f);
    };
    const ready = (ext: unknown) => {
        if (!ext) return true;
        const COMPLETION_STATUS_KHR = 0x91b1;
        return !!gl.getProgramParameter(program, COMPLETION_STATUS_KHR);
    };
    return { program, uniforms, u, check, ready };
}

export type Target = {
    fbo: WebGLFramebuffer;
    tex: WebGLTexture;
    width: number;
    height: number;
};

export function createTarget(
    gl: WebGL2RenderingContext,
    width: number,
    height: number,
    opts: { internalFormat: number; format: number; type: number; filter: number }
): Target {
    const tex = gl.createTexture();
    const fbo = gl.createFramebuffer();
    if (!tex || !fbo) throw new Error("[dive] target alloc failed");
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, opts.internalFormat, width, height, 0, opts.format, opts.type, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, opts.filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, opts.filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
        gl.deleteTexture(tex);
        gl.deleteFramebuffer(fbo);
        throw new Error(`[dive] framebuffer incomplete: 0x${status.toString(16)}`);
    }
    return { fbo, tex, width, height };
}

export function deleteTarget(gl: WebGL2RenderingContext, t: Target | null) {
    if (!t) return;
    gl.deleteTexture(t.tex);
    gl.deleteFramebuffer(t.fbo);
}

export function createTextureFromCanvas(
    gl: WebGL2RenderingContext,
    source: TexImageSource,
    mipmap = false
): WebGLTexture {
    const tex = gl.createTexture();
    if (!tex) throw new Error("[dive] texture alloc failed");
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    if (mipmap) {
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
}
