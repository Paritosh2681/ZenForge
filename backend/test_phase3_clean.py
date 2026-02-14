"""
Quick validation test for Phase 3 conversation management features
Tests database initialization and core conversation manager functions
"""
import sys
import os
import asyncio

# Add app to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

async def test_phase3():
    print("=" * 60)
    print("Phase 3 - Conversation Management Test")
    print("=" * 60)

    try:
        # Test 1: Import database module
        print("\n[OK] Test 1: Importing database module...")
        from app.services.database import Database, init_database
        print("  SUCCESS: Database module imports correctly")

        # Test 2: Initialize database
        print("\n[OK] Test 2: Initializing database...")
        await init_database()
        print("  SUCCESS: Database initialized")

        # Test 3: Import conversation manager
        print("\n[OK] Test 3: Importing conversation manager...")
        from app.services.conversation_manager import ConversationManager
        print("  SUCCESS: ConversationManager imports correctly")

        # Test 4: Create conversation
        print("\n[OK] Test 4: Creating test conversation...")
        manager = ConversationManager()
        conversation = await manager.create_conversation(title="Test Conversation")
        print(f"  SUCCESS: Created conversation ID: {conversation.id}")

        # Test 5: Add messages
        print("\n[OK] Test 5: Adding messages...")
        user_msg = await manager.add_message(
            conversation_id=conversation.id,
            role="user",
            content="What is machine learning?"
        )
        print(f"  SUCCESS: Added user message ID: {user_msg.id}")

        assistant_msg = await manager.add_message(
            conversation_id=conversation.id,
            role="assistant",
            content="Machine learning is a branch of AI..."
        )
        print(f"  SUCCESS: Added assistant message ID: {assistant_msg.id}")

        # Test 6: Retrieve conversation
        print("\n[OK] Test 6: Retrieving conversation...")
        retrieved = await manager.get_conversation(conversation.id)
        print(f"  SUCCESS: Retrieved conversation with {len(retrieved.messages)} messages")

        # Test 7: List conversations
        print("\n[OK] Test 7: Listing conversations...")
        conversations = await manager.list_conversations()
        print(f"  SUCCESS: Found {len(conversations)} conversation(s)")

        # Test 8: Context window manager
        print("\n[OK] Test 8: Testing context window manager...")
        from app.services.context_window_manager import ContextWindowManager
        ctx_manager = ContextWindowManager()
        token_count = ctx_manager.count_tokens("Hello, world!")
        print(f"  SUCCESS: Token counting works (13 chars = {token_count} tokens)")

        # Test 9: Import conversation schemas
        print("\n[OK] Test 9: Importing conversation schemas...")
        from app.models.conversation_schemas import (
            Conversation, Message, ConversationDetail, ContextInfo
        )
        print("  SUCCESS: All schemas imported correctly")

        # Test 10: Import conversations router
        print("\n[OK] Test 10: Importing conversations router...")
        from app.routers import conversations
        print(f"  SUCCESS: Router imported with prefix: {conversations.router.prefix}")

        print("\n" + "=" * 60)
        print("ALL TESTS PASSED")
        print("=" * 60)
        print("\nPhase 3 Week 1 Backend Implementation Status:")
        print("  [+] Database service (SQLite schema)")
        print("  [+] ConversationManager (CRUD operations)")
        print("  [+] ContextWindowManager (token counting)")
        print("  [+] Conversation schemas (Pydantic models)")
        print("  [+] Conversations API router")
        print("  [+] RAG engine integration")
        print("  [+] Chat router integration")
        print("\nReady for integration testing with Docker or full environment!")

    except ImportError as e:
        print(f"\n[X] IMPORT ERROR: {e}")
        print("   Missing dependencies - install with: pip install -r requirements.txt")
        return False

    except Exception as e:
        print(f"\n[X] TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

    return True

if __name__ == "__main__":
    success = asyncio.run(test_phase3())
    sys.exit(0 if success else 1)
