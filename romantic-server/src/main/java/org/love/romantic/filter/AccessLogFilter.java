package org.love.romantic.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

/**
 * 接口访问日志过滤器。
 * 参考外部项目里的访问日志过滤器思路，统一记录请求方法、路径、参数、请求体和响应状态。
 */
@Slf4j
@Component
public class AccessLogFilter extends OncePerRequestFilter {

    private static final int BODY_LOG_LIMIT = 1000;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        ContentCachingRequestWrapper requestWrapper = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);
        long startTime = System.currentTimeMillis();

        try {
            filterChain.doFilter(requestWrapper, responseWrapper);
        } finally {
            printAccessLog(requestWrapper, responseWrapper, System.currentTimeMillis() - startTime);
            responseWrapper.copyBodyToResponse();
        }
    }

    private void printAccessLog(ContentCachingRequestWrapper request,
                                ContentCachingResponseWrapper response,
                                long costMillis) {
        StringBuilder builder = new StringBuilder(256);
        builder.append("AccessLog:").append('\n');
        builder.append(request.getMethod()).append(' ').append(request.getRequestURI());

        String queryString = request.getQueryString();
        if (StringUtils.hasText(queryString)) {
            builder.append('?').append(queryString);
        }
        builder.append('\n');

        String authorization = request.getHeader("Authorization");
        if (StringUtils.hasText(authorization)) {
            builder.append("Authorization: ").append(authorization).append('\n');
        }

        String requestBody = readBody(request.getContentAsByteArray(), request.getContentType());
        if (StringUtils.hasText(requestBody)) {
            builder.append("RequestBody: ").append(requestBody).append('\n');
        }

        builder.append("<-- ")
                .append(response.getStatus())
                .append(" (")
                .append(costMillis)
                .append("ms)")
                .append('\n');

//        String responseBody = readBody(response.getContentAsByteArray(), response.getContentType());
//        if (StringUtils.hasText(responseBody)) {
//            builder.append("ResponseBody: ").append(responseBody).append('\n');
//        }

        log.info(builder.toString());
    }

    private String readBody(byte[] bodyBytes, String contentType) {
        if (bodyBytes == null || bodyBytes.length == 0 || !isJsonBody(contentType)) {
            return null;
        }

        String body = new String(bodyBytes, StandardCharsets.UTF_8).trim();
        if (!StringUtils.hasText(body)) {
            return null;
        }

        return body.length() > BODY_LOG_LIMIT ? body.substring(0, BODY_LOG_LIMIT) + "..." : body;
    }

    private boolean isJsonBody(String contentType) {
        if (!StringUtils.hasText(contentType)) {
            return false;
        }

        try {
            MediaType mediaType = MediaType.parseMediaType(contentType);
            return MediaType.APPLICATION_JSON.isCompatibleWith(mediaType)
                    || Optional.ofNullable(mediaType.getSubtype()).orElse("").contains("json");
        } catch (Exception exception) {
            return false;
        }
    }
}
