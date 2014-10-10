/**
 * ----------------- Matrix
 *
 *
 * Represents a 4x4 matrix stored in row-major order that uses Float32Arrays when available. Matrix operations can either be done using convenient methods that return a new matrix for the result or optimized methods that store the result in an existing matrix to avoid generating garbage.
 *
 * with a nod to http://evanw.github.io/lightgl.js/docs/matrix.html
 */


/**
 * This constructor takes 16 arguments in row-major order, which can be passed individually, as a list, or even as four lists, one for each row. If the arguments are omitted then the identity matrix is constructed instead.
 */

function Matrix() {
    var m = Array.prototype.concat.apply([], arguments),
        _m;
    if (!m.length) {
        _m = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
        this.m = (typeof Float32Array != 'undefined') ? new Float32Array(_m) : _m;
    } else if (m.length < 16) {
        _m = [
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0
        ];
        for (var i = 0, len = m.length; i < len; i++) {
            _m[i] = m[i];
        }
        this.m = (typeof Float32Array != 'undefined') ? new Float32Array(_m) : _m;
    } else {
        this.m = (typeof Float32Array != 'undefined') ? new Float32Array(m) : m;
    }
}

Matrix.prototype.transpose = function(matrix, result) {
    result = result || new Matrix();
    var m = matrix.m,
        r = result.m;
    r[0] = m[0];
    r[1] = m[4];
    r[2] = m[8];
    r[3] = m[12];
    r[4] = m[1];
    r[5] = m[5];
    r[6] = m[9];
    r[7] = m[13];
    r[8] = m[2];
    r[9] = m[6];
    r[10] = m[10];
    r[11] = m[14];
    r[12] = m[3];
    r[13] = m[7];
    r[14] = m[11];
    r[15] = m[15];
    return result;
};

Matrix.prototype.col = function(index, result) {
    result = result || new Array(4);
    var r = result,
        im4 = index % 4;
    r[0] = this.m[im4];
    r[1] = this.m[im4 + 4];
    r[2] = this.m[im4 + 8];
    r[3] = this.m[im4 + 12];
    return r;
};

/**
 * Returns the concatenation of the transforms for left and right. You can optionally pass an existing matrix in result to avoid allocating a new matrix. This emulates the OpenGL function glMultMatrix().
 */

Matrix.prototype._multiply = function(left, right, result) {
    result = result || new Matrix();
    var a = left.m,
        b = right.m,
        r = result.m;

    r[0] = a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12];
    r[1] = a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13];
    r[2] = a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14];
    r[3] = a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15];

    r[4] = a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12];
    r[5] = a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13];
    r[6] = a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14];
    r[7] = a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15];

    r[8] = a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12];
    r[9] = a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13];
    r[10] = a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14];
    r[11] = a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15];

    r[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12];
    r[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13];
    r[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14];
    r[15] = a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15];

    return result;
};

/**
 * Returns the concatenation of the transforms for this matrix and matrix. This emulates the OpenGL function glMultMatrix().
 */
Matrix.prototype.multiply = function(matrix) {
    return this._multiply(this, matrix, new Matrix());
};

/**
 * Returns an identity matrix. You can optionally pass an existing matrix in result to avoid allocating a new matrix. This emulates the OpenGL function glLoadIdentity().
 */
Matrix.prototype.identity = function(result) {
    result = result || new Matrix();
    var m = result.m;
    m[0] = m[5] = m[10] = m[15] = 1;
    m[1] = m[2] = m[3] = m[4] = m[6] = m[7] = m[8] = m[9] = m[11] = m[12] = m[13] = m[14] = 0;
    return result;
};

/**
 * Returns a perspective transform matrix, which makes far away objects appear smaller than nearby objects. The aspect argument should be the width divided by the height of your viewport and fov is the top-to-bottom angle of the field of view in degrees. You can optionally pass an existing matrix in result to avoid allocating a new matrix. This emulates the OpenGL function gluPerspective().
 */
Matrix.prototype.perspective = function(fov, aspect, near, far, result) {
    var y = Math.tan(fov * Math.PI / 360) * near;
    var x = y * aspect;
    return this.frustum(-x, x, -y, y, near, far, result);
};

/**
 * GL.Matrix.frustum(left, right, bottom, top, near, far[, result])
 * Sets up a viewing frustum, which is shaped like a truncated pyramid with the camera where the point of the pyramid would be. You can optionally pass an existing matrix in result to avoid allocating a new matrix. This emulates the OpenGL function glFrustum().
 */
Matrix.prototype.frustum = function(l, r, b, t, n, f, result) {
    result = result || new Matrix();
    var m = result.m;

    m[0] = 2 * n / (r - l);
    m[1] = 0;
    m[2] = (r + l) / (r - l);
    m[3] = 0;

    m[4] = 0;
    m[5] = 2 * n / (t - b);
    m[6] = (t + b) / (t - b);
    m[7] = 0;

    m[8] = 0;
    m[9] = 0;
    m[10] = -(f + n) / (f - n);
    m[11] = -2 * f * n / (f - n);

    m[12] = 0;
    m[13] = 0;
    m[14] = -1;
    m[15] = 0;

    return result;
};

/**
 * This emulates the OpenGL function glScale(). You can optionally pass an existing matrix in result to avoid allocating a new matrix.
 */
Matrix.prototype.scale = function(x, y, z, result) {
    result = result || new Matrix();
    var m = result.m;

    m[0] = x;
    m[1] = 0;
    m[2] = 0;
    m[3] = 0;

    m[4] = 0;
    m[5] = y;
    m[6] = 0;
    m[7] = 0;

    m[8] = 0;
    m[9] = 0;
    m[10] = z;
    m[11] = 0;

    m[12] = 0;
    m[13] = 0;
    m[14] = 0;
    m[15] = 1;

    return result;
};

/**
 * This emulates the OpenGL function glTranslate(). You can optionally pass an existing matrix in result to avoid allocating a new matrix.
 */
Matrix.prototype.translate = function(x, y, z, result) {
    result = result || new Matrix();
    var m = result.m;

    m[0] = 1;
    m[1] = 0;
    m[2] = 0;
    m[3] = x;

    m[4] = 0;
    m[5] = 1;
    m[6] = 0;
    m[7] = y;

    m[8] = 0;
    m[9] = 0;
    m[10] = 1;
    m[11] = z;

    m[12] = 0;
    m[13] = 0;
    m[14] = 0;
    m[15] = 1;

    return result;
};

/**
 * Returns a matrix that rotates by a degrees around the vector x, y, z. You can optionally pass an existing matrix in result to avoid allocating a new matrix. This emulates the OpenGL function glRotate().
 */
Matrix.prototype.rotate = function(a, x, y, z, result) {
    if (!a || (!x && !y && !z)) {
        return Matrix.identity(result);
    }

    result = result || new Matrix();
    var m = result.m;

    var d = Math.sqrt(x * x + y * y + z * z);
    a *= Math.PI / 180;
    x /= d;
    y /= d;
    z /= d;
    var c = Math.cos(a),
        s = Math.sin(a),
        t = 1 - c;

    m[0] = x * x * t + c;
    m[1] = x * y * t - z * s;
    m[2] = x * z * t + y * s;
    m[3] = 0;

    m[4] = y * x * t + z * s;
    m[5] = y * y * t + c;
    m[6] = y * z * t - x * s;
    m[7] = 0;

    m[8] = z * x * t - y * s;
    m[9] = z * y * t + x * s;
    m[10] = z * z * t + c;
    m[11] = 0;

    m[12] = 0;
    m[13] = 0;
    m[14] = 0;
    m[15] = 1;

    return result;
};

/**
 * Returns a matrix that puts the camera at the eye point ex, ey, ez looking toward the center point cx, cy, cz with an up direction of ux, uy, uz. You can optionally pass an existing matrix in result to avoid allocating a new matrix. This emulates the OpenGL function gluLookAt().
 */
Matrix.prototype.lookAt = function(ex, ey, ez, cx, cy, cz, ux, uy, uz, result) {
    result = result || new Matrix();
    var m = result.m;

    var e = new Vector(ex, ey, ez);
    var c = new Vector(cx, cy, cz);
    var u = new Vector(ux, uy, uz);
    var f = e.subtract(c).unit();
    var s = u.cross(f).unit();
    var t = f.cross(s).unit();

    m[0] = s.x;
    m[1] = s.y;
    m[2] = s.z;
    m[3] = -s.dot(e);

    m[4] = t.x;
    m[5] = t.y;
    m[6] = t.z;
    m[7] = -t.dot(e);

    m[8] = f.x;
    m[9] = f.y;
    m[10] = f.z;
    m[11] = -f.dot(e);

    m[12] = 0;
    m[13] = 0;
    m[14] = 0;
    m[15] = 1;

    return result;
};