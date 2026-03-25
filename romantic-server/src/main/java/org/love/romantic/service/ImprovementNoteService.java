package org.love.romantic.service;

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
}
