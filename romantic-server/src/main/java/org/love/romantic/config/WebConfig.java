package org.love.romantic.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web 层配置。
 * 统一处理跨域、鉴权拦截和本地上传文件的静态映射。
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AuthTokenInterceptor authTokenInterceptor;
    private final StorageProperties storageProperties;

    public WebConfig(AuthTokenInterceptor authTokenInterceptor, StorageProperties storageProperties) {
        this.authTokenInterceptor = authTokenInterceptor;
        this.storageProperties = storageProperties;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authTokenInterceptor)
                .addPathPatterns(
                        "/api/profiles/**",
                        "/api/files/**",
                        "/api/countdown/**",
                        "/api/daily-summaries/**",
                        "/api/albums/**",
                        "/api/anniversaries/**",
                        "/api/notifications/**",
                        "/api/improvement-notes/**",
                        "/api/auth/logout"
                )
                .excludePathPatterns("/api/health/**");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String resourceLocation = storageProperties.getRootDirectory().toUri().toString();
        if (!resourceLocation.endsWith("/")) {
            resourceLocation = resourceLocation + "/";
        }
        registry.addResourceHandler(storageProperties.getPublicPathPrefixNormalized() + "/**")
                .addResourceLocations(resourceLocation);
    }
}
