class ApiBuilder {
    constructor(baseRequest, defaultHeaders = {}, basePath = '') {
        this.baseRequest = baseRequest;
        this.defaultHeaders = defaultHeaders;
        this.basePath = basePath.replace(/\/+$/, ''); // Remove trailing slashes from basePath
        this.reset();
    }

    reset() {
        this.headers = {};
        this.cookies = '';
        this.queryParams = null;
        this.expectCode = null;
        this.payload = null;
        this.contentType = 'application/json';
        return this;
    }

    withHeaders(headers) {
        this.headers = { ...this.headers, ...headers };
        return this;
    }

    withCookie(cookieString) {
        this.cookies += (this.cookies ? '; ' : '') + cookieString;
        return this;
    }

    withQuery(params) {
        this.queryParams = params;
        return this;
    }

    withContentType(type) {
        this.contentType = type;
        return this;
    }

    sendJson(data) {
        this.payload = data;
        this.contentType = 'application/json';
        return this;
    }

    expectStatus(code) {
        this.expectCode = code;
        return this;
    }

    // Normalize basePath and route to avoid double or missing slashes
    _normalizePath(base, path) {
        const cleanBase = base.replace(/\/+$/, ''); // remove trailing slashes
        const cleanPath = path.replace(/^\/+/, ''); // remove leading slashes
        return `${cleanBase}/${cleanPath}`;
    }

    async _buildAndSend(method, url) {
        const qualifiedUrl = this._normalizePath(this.basePath, url);

        let req = this.baseRequest[method](qualifiedUrl);

        const combinedHeaders = { ...this.defaultHeaders, ...this.headers };
        for (const [key, value] of Object.entries(combinedHeaders)) {
            req.set(key, value);
        }

        if (this.cookies) {
            req.set('Cookie', this.cookies);
        }

        if (this.queryParams) {
            req.query(this.queryParams);
        }

        if (this.payload) {
            req.set('Content-Type', this.contentType);
            req.send(this.payload);
        }

        if (this.expectCode) {
            req.expect(this.expectCode);
        }

        const res = await req;
        this.reset();
        return res;
    }

    get(url) { return this._buildAndSend('get', url); }
    post(url) { return this._buildAndSend('post', url); }
    put(url) { return this._buildAndSend('put', url); }
    patch(url) { return this._buildAndSend('patch', url); }
    delete(url) { return this._buildAndSend('delete', url); }
}

module.exports = ApiBuilder;