import { useState } from 'react';
import { X, Send, Reply } from 'lucide-react';
import { Comment } from '../App';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';

interface CommentSidebarProps {
  comments: Comment[];
  onClose: () => void;
  onAddComment: (content: string, parentId?: string) => void;
}

export function CommentSidebar({ comments, onClose, onAddComment }: CommentSidebarProps) {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  const handleSubmitReply = (parentId: string) => {
    if (replyContent.trim()) {
      onAddComment(replyContent, parentId);
      setReplyContent('');
      setReplyTo(null);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={`${isReply ? 'ml-8 mt-2' : 'mt-4 first:mt-0'} space-y-2`}
    >
      <div className="p-3 bg-card border rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm">{comment.author}</span>
          <span className="text-xs text-muted-foreground">
            {formatTime(comment.timestamp)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{comment.content}</p>
        {!isReply && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReplyTo(comment.id)}
            className="mt-2 h-7 text-xs"
          >
            <Reply className="size-3 mr-1" />
            Reply
          </Button>
        )}
      </div>

      {/* Reply input */}
      {replyTo === comment.id && (
        <div className="ml-8 space-y-2">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            className="min-h-[80px]"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleSubmitReply(comment.id)}
              disabled={!replyContent.trim()}
            >
              <Send className="size-3 mr-2" />
              Reply
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setReplyTo(null);
                setReplyContent('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-80 border-l bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="text-sm">Comments</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="size-4" />
        </Button>
      </div>

      {/* Comments list */}
      <ScrollArea className="flex-1 p-4">
        {comments.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div>{comments.map((comment) => renderComment(comment))}</div>
        )}
      </ScrollArea>

      {/* New comment input */}
      <div className="p-4 border-t space-y-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="min-h-[100px]"
        />
        <Button
          onClick={handleSubmitComment}
          disabled={!newComment.trim()}
          className="w-full"
        >
          <Send className="size-4 mr-2" />
          Add Comment
        </Button>
      </div>
    </div>
  );
}
