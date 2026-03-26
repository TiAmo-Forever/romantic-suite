package org.love.romantic.service;

import org.love.romantic.model.AlbumMemoryRequest;
import org.love.romantic.model.AlbumMemoryResponse;
import org.love.romantic.model.InteractionCommentRequest;
import org.love.romantic.model.InteractionCommentResponse;
import org.love.romantic.model.InteractionLikeToggleResponse;

import java.util.List;

public interface AlbumMemoryService {

    List<AlbumMemoryResponse> listMemories();

    AlbumMemoryResponse getMemory(Long id);

    AlbumMemoryResponse createMemory(AlbumMemoryRequest request);

    AlbumMemoryResponse updateMemory(Long id, AlbumMemoryRequest request);

    void deleteMemory(Long id);

    InteractionLikeToggleResponse toggleLike(Long id);

    InteractionCommentResponse addComment(Long id, InteractionCommentRequest request);

    void deleteComment(Long id, Long commentId);
}
