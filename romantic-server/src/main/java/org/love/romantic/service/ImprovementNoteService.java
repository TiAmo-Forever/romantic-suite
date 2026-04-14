package org.love.romantic.service;

import org.love.romantic.model.InteractionCommentRequest;
import org.love.romantic.model.InteractionCommentResponse;
import org.love.romantic.model.InteractionLikeToggleResponse;
import org.love.romantic.model.ImprovementFeedbackRequest;
import org.love.romantic.model.ImprovementNoteRequest;
import org.love.romantic.model.ImprovementNoteResponse;

import java.util.List;

public interface ImprovementNoteService {

    List<ImprovementNoteResponse> listNotes(String status);

    ImprovementNoteResponse getNote(Long id);

    ImprovementNoteResponse createNote(ImprovementNoteRequest request);

    ImprovementNoteResponse updateNote(Long id, ImprovementNoteRequest request);

    void deleteNote(Long id);

    ImprovementNoteResponse addFeedback(Long id, ImprovementFeedbackRequest request);

    ImprovementNoteResponse updateFeedback(Long id, Long feedbackId, ImprovementFeedbackRequest request);

    ImprovementNoteResponse deleteFeedback(Long id, Long feedbackId);

    InteractionLikeToggleResponse toggleFeedbackLike(Long id, Long feedbackId);

    InteractionCommentResponse addFeedbackComment(Long id, Long feedbackId, InteractionCommentRequest request);

    void deleteFeedbackComment(Long id, Long feedbackId, Long commentId);
}
